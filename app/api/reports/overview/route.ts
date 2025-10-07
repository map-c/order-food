import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import type { ReportOverview, ReportStats, RevenueDataPoint, CategorySales, TopDishData, HourlyData } from '@/types/reports'
import { format } from 'date-fns'

const querySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  compareStartDate: z.string().datetime().optional(),
  compareEndDate: z.string().datetime().optional(),
})

/**
 * 获取综合报表数据
 * GET /api/reports/overview?startDate=xxx&endDate=xxx&compareStartDate=xxx&compareEndDate=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      compareStartDate: searchParams.get('compareStartDate'),
      compareEndDate: searchParams.get('compareEndDate'),
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

    const { startDate, endDate, compareStartDate, compareEndDate } = validationResult.data

    // 1. 获取核心统计数据
    const stats = await getReportStats(
      new Date(startDate),
      new Date(endDate),
      compareStartDate ? new Date(compareStartDate) : undefined,
      compareEndDate ? new Date(compareEndDate) : undefined
    )

    // 2. 获取营业额趋势数据
    const revenueChart = await getRevenueChart(
      new Date(startDate),
      new Date(endDate)
    )

    // 3. 获取分类销售数据
    const categoryChart = await getCategoryChart(
      new Date(startDate),
      new Date(endDate)
    )

    // 4. 获取热销菜品数据
    const topDishes = await getTopDishes(
      new Date(startDate),
      new Date(endDate),
      5 // TOP 5
    )

    // 5. 获取时段分析数据
    const hourlyAnalysis = await getHourlyAnalysis(
      new Date(startDate),
      new Date(endDate)
    )

    const data: ReportOverview = {
      stats,
      revenueChart,
      categoryChart,
      topDishes,
      hourlyAnalysis,
    }

    return apiResponse.success(data)
  } catch (error) {
    console.error('Get report overview error:', error)
    return apiResponse.error(
      '获取报表数据失败',
      'INTERNAL_ERROR',
      500
    )
  }
}

/**
 * 获取核心统计数据
 */
async function getReportStats(
  startDate: Date,
  endDate: Date,
  compareStartDate?: Date,
  compareEndDate?: Date
): Promise<ReportStats> {
  // 当前期间的统计
  const currentStats = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isPaid: true,
    },
    _sum: {
      totalPrice: true,
    },
    _count: true,
  })

  const totalRevenue = currentStats._sum.totalPrice || 0
  const totalOrders = currentStats._count
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // 如果有对比期，计算增长率
  let comparison
  if (compareStartDate && compareEndDate) {
    const compareStats = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: compareStartDate,
          lte: compareEndDate,
        },
        isPaid: true,
      },
      _sum: {
        totalPrice: true,
      },
      _count: true,
    })

    const compareRevenue = compareStats._sum.totalPrice || 0
    const compareOrders = compareStats._count
    const compareAvgOrder = compareOrders > 0 ? compareRevenue / compareOrders : 0

    comparison = {
      revenueGrowth: compareRevenue > 0
        ? ((totalRevenue - compareRevenue) / compareRevenue) * 100
        : 0,
      ordersGrowth: compareOrders > 0
        ? ((totalOrders - compareOrders) / compareOrders) * 100
        : 0,
      avgOrderGrowth: compareAvgOrder > 0
        ? ((avgOrderValue - compareAvgOrder) / compareAvgOrder) * 100
        : 0,
    }
  }

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
    profitRate: 58.3, // TODO: 需要成本数据计算真实利润率
    comparison,
  }
}

/**
 * 获取营业额趋势数据（按天聚合）
 */
async function getRevenueChart(startDate: Date, endDate: Date): Promise<RevenueDataPoint[]> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isPaid: true,
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  })

  // 按日期聚合
  const dailyData = new Map<string, { revenue: number; orders: number }>()

  orders.forEach((order) => {
    const date = format(order.createdAt, 'yyyy-MM-dd')
    const existing = dailyData.get(date) || { revenue: 0, orders: 0 }

    dailyData.set(date, {
      revenue: existing.revenue + order.totalPrice,
      orders: existing.orders + 1,
    })
  })

  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      revenue: Number(data.revenue.toFixed(2)),
      orders: data.orders,
      avgOrder: Number((data.orders > 0 ? data.revenue / data.orders : 0).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 获取分类销售数据
 */
async function getCategoryChart(startDate: Date, endDate: Date): Promise<CategorySales[]> {
  const categoryStats = await prisma.orderItem.groupBy({
    by: ['dishId'],
    where: {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        isPaid: true,
      },
    },
    _sum: {
      subtotal: true,
      quantity: true,
    },
  })

  // 获取菜品和分类信息
  const dishIds = categoryStats.map(stat => stat.dishId)
  const dishes = await prisma.dish.findMany({
    where: { id: { in: dishIds } },
    include: { category: true },
  })

  // 按分类聚合
  const categoryMap = new Map<string, { name: string; revenue: number; orders: number }>()

  categoryStats.forEach((stat) => {
    const dish = dishes.find(d => d.id === stat.dishId)
    if (!dish) return

    const existing = categoryMap.get(dish.categoryId) || {
      name: dish.category.name,
      revenue: 0,
      orders: 0,
    }

    categoryMap.set(dish.categoryId, {
      name: existing.name,
      revenue: existing.revenue + (stat._sum.subtotal || 0),
      orders: existing.orders + (stat._sum.quantity || 0),
    })
  })

  const totalRevenue = Array.from(categoryMap.values())
    .reduce((sum, item) => sum + item.revenue, 0)

  return Array.from(categoryMap.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      totalRevenue: Number(data.revenue.toFixed(2)),
      totalOrders: data.orders,
      percentage: Number((totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0).toFixed(2)),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
}

/**
 * 获取热销菜品数据
 */
async function getTopDishes(startDate: Date, endDate: Date, limit: number): Promise<TopDishData[]> {
  const dishStats = await prisma.orderItem.groupBy({
    by: ['dishId'],
    where: {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        isPaid: true,
      },
    },
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
  const dishIds = dishStats.map(stat => stat.dishId)
  const dishes = await prisma.dish.findMany({
    where: { id: { in: dishIds } },
    include: { category: true },
  })

  // TODO: 计算增长率需要对比期数据

  return dishStats.map((stat) => {
    const dish = dishes.find(d => d.id === stat.dishId)
    return {
      dishId: stat.dishId,
      dishName: dish?.name || 'Unknown',
      categoryName: dish?.category.name || 'Unknown',
      sales: stat._sum.quantity || 0,
      revenue: Number((stat._sum.subtotal || 0).toFixed(2)),
      growth: 0, // TODO: 实现增长率计算
    }
  })
}

/**
 * 获取时段分析数据
 */
async function getHourlyAnalysis(startDate: Date, endDate: Date): Promise<HourlyData[]> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isPaid: true,
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  })

  // 按小时聚合
  const hourlyMap = new Map<number, { orders: number; revenue: number }>()

  orders.forEach((order) => {
    const hour = order.createdAt.getHours()
    const existing = hourlyMap.get(hour) || { orders: 0, revenue: 0 }

    hourlyMap.set(hour, {
      orders: existing.orders + 1,
      revenue: existing.revenue + order.totalPrice,
    })
  })

  // 转换为时间段格式
  return Array.from(hourlyMap.entries())
    .map(([hour, data]) => ({
      timeRange: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
      orders: data.orders,
      revenue: Number(data.revenue.toFixed(2)),
      avgOrder: Number((data.orders > 0 ? data.revenue / data.orders : 0).toFixed(2)),
    }))
    .sort((a, b) => parseInt(a.timeRange) - parseInt(b.timeRange))
}
