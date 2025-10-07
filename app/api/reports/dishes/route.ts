import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import type { TopDishData } from '@/types/reports'

const querySchema = z.object({
  startDate: z.string({ required_error: '开始日期不能为空' }).datetime('开始日期格式不正确'),
  endDate: z.string({ required_error: '结束日期不能为空' }).datetime('结束日期格式不正确'),
  limit: z.string().optional().default('10'),
  categoryId: z.string().optional(),
  compareStartDate: z.string().datetime().optional(),
  compareEndDate: z.string().datetime().optional(),
})

/**
 * 获取菜品销售报表
 * GET /api/reports/dishes?startDate=xxx&endDate=xxx&limit=10&categoryId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || '10',
      categoryId: searchParams.get('categoryId') || undefined,
      compareStartDate: searchParams.get('compareStartDate') || undefined,
      compareEndDate: searchParams.get('compareEndDate') || undefined,
    }

    // 验证参数
    const validationResult = querySchema.safeParse(params)
    if (!validationResult.success) {
      return apiResponse.error(
        '参数验证失败: ' + validationResult.error.errors[0].message,
        'VALIDATION_ERROR',
        400
      )
    }

    const { startDate, endDate, limit, categoryId, compareStartDate, compareEndDate } =
      validationResult.data

    const limitNum = parseInt(limit)

    // 获取当前期间数据
    const currentData = await getDishSalesData(
      new Date(startDate),
      new Date(endDate),
      limitNum,
      categoryId
    )

    // 如果有对比期，计算增长率
    let dataWithGrowth = currentData
    if (compareStartDate && compareEndDate) {
      const compareData = await getDishSalesData(
        new Date(compareStartDate),
        new Date(compareEndDate),
        limitNum,
        categoryId
      )

      dataWithGrowth = currentData.map((current) => {
        const compare = compareData.find((c) => c.dishId === current.dishId)
        const growth = compare
          ? compare.sales > 0
            ? ((current.sales - compare.sales) / compare.sales) * 100
            : 0
          : 0

        return {
          ...current,
          growth: Number(growth.toFixed(2)),
        }
      })
    }

    // 计算汇总数据
    const summary = {
      totalSales: dataWithGrowth.reduce((sum, item) => sum + item.sales, 0),
      totalRevenue: dataWithGrowth.reduce((sum, item) => sum + item.revenue, 0),
      dishCount: dataWithGrowth.length,
    }

    return apiResponse.success({
      dishes: dataWithGrowth,
      summary,
    })
  } catch (error) {
    console.error('Get dishes report error:', error)
    return apiResponse.error(
      '获取菜品销售报表失败',
      'INTERNAL_ERROR',
      500
    )
  }
}

/**
 * 获取菜品销售数据
 */
async function getDishSalesData(
  startDate: Date,
  endDate: Date,
  limit: number,
  categoryId?: string
): Promise<TopDishData[]> {
  // 构建查询条件
  const whereCondition: any = {
    order: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isPaid: true,
    },
  }

  // 如果指定了分类，需要通过 dish 关联查询
  if (categoryId) {
    whereCondition.dish = {
      categoryId,
    }
  }

  const dishStats = await prisma.orderItem.groupBy({
    by: ['dishId'],
    where: whereCondition,
    _sum: {
      quantity: true,
      subtotal: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: limit,
  })

  // 获取菜品详情
  const dishIds = dishStats.map((stat) => stat.dishId)
  const dishes = await prisma.dish.findMany({
    where: { id: { in: dishIds } },
    include: { category: true },
  })

  return dishStats.map((stat) => {
    const dish = dishes.find((d) => d.id === stat.dishId)
    return {
      dishId: stat.dishId,
      dishName: dish?.name || 'Unknown',
      categoryName: dish?.category.name || 'Unknown',
      sales: stat._sum.quantity || 0,
      revenue: Number((stat._sum.subtotal || 0).toFixed(2)),
      growth: 0, // 由调用方计算
    }
  })
}
