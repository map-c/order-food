import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import type { HourlyData } from '@/types/reports'

const querySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

/**
 * 获取时段分析报表
 * GET /api/reports/hourly?startDate=xxx&endDate=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
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

    const { startDate, endDate } = validationResult.data

    const data = await getHourlyData(new Date(startDate), new Date(endDate))

    // 计算汇总数据
    const summary = {
      totalOrders: data.reduce((sum, item) => sum + item.orders, 0),
      totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
      peakHour: data.length > 0
        ? data.reduce((max, item) => item.revenue > max.revenue ? item : max).timeRange
        : null,
    }

    return apiResponse.success({
      data,
      summary,
    })
  } catch (error) {
    console.error('Get hourly report error:', error)
    return apiResponse.error(
      '获取时段分析报表失败',
      'INTERNAL_ERROR',
      500
    )
  }
}

/**
 * 获取时段分析数据
 */
async function getHourlyData(
  startDate: Date,
  endDate: Date
): Promise<HourlyData[]> {
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

  // 生成完整的24小时数据（补充没有订单的时段）
  const result: HourlyData[] = []
  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyMap.get(hour) || { orders: 0, revenue: 0 }
    result.push({
      timeRange: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
      orders: data.orders,
      revenue: Number(data.revenue.toFixed(2)),
      avgOrder: Number((data.orders > 0 ? data.revenue / data.orders : 0).toFixed(2)),
    })
  }

  return result
}
