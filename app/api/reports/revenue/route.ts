import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import { format, startOfHour, startOfDay, startOfMonth } from 'date-fns'

const querySchema = z.object({
  startDate: z.string({ required_error: '开始日期不能为空' }).datetime('开始日期格式不正确'),
  endDate: z.string({ required_error: '结束日期不能为空' }).datetime('结束日期格式不正确'),
  granularity: z.enum(['hour', 'day', 'month']).optional().default('day'),
})

export interface RevenuePoint {
  time: string
  revenue: number
  orders: number
  avgOrder: number
}

/**
 * 获取营业额报表（支持按小时、天、月聚合）
 * GET /api/reports/revenue?startDate=xxx&endDate=xxx&granularity=day
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      granularity: searchParams.get('granularity') || 'day',
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

    const { startDate, endDate, granularity } = validationResult.data

    const data = await getRevenueData(
      new Date(startDate),
      new Date(endDate),
      granularity
    )

    return apiResponse.success({
      granularity,
      data,
      summary: {
        totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
        totalOrders: data.reduce((sum, item) => sum + item.orders, 0),
        avgOrderValue: data.length > 0
          ? data.reduce((sum, item) => sum + item.revenue, 0) /
            data.reduce((sum, item) => sum + item.orders, 0)
          : 0,
      },
    })
  } catch (error) {
    console.error('Get revenue report error:', error)
    return apiResponse.error(
      '获取营业额报表失败',
      'INTERNAL_ERROR',
      500
    )
  }
}

/**
 * 获取营业额数据（按指定粒度聚合）
 */
async function getRevenueData(
  startDate: Date,
  endDate: Date,
  granularity: 'hour' | 'day' | 'month'
): Promise<RevenuePoint[]> {
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
    orderBy: {
      createdAt: 'asc',
    },
  })

  // 按粒度聚合
  const dataMap = new Map<string, { revenue: number; orders: number }>()

  orders.forEach((order) => {
    let key: string

    switch (granularity) {
      case 'hour':
        key = format(startOfHour(order.createdAt), 'yyyy-MM-dd HH:00')
        break
      case 'month':
        key = format(startOfMonth(order.createdAt), 'yyyy-MM')
        break
      case 'day':
      default:
        key = format(startOfDay(order.createdAt), 'yyyy-MM-dd')
        break
    }

    const existing = dataMap.get(key) || { revenue: 0, orders: 0 }
    dataMap.set(key, {
      revenue: existing.revenue + order.totalPrice,
      orders: existing.orders + 1,
    })
  })

  return Array.from(dataMap.entries())
    .map(([time, data]) => ({
      time,
      revenue: Number(data.revenue.toFixed(2)),
      orders: data.orders,
      avgOrder: Number((data.orders > 0 ? data.revenue / data.orders : 0).toFixed(2)),
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}
