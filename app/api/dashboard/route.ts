import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import type { DashboardOverview, DashboardStats, SalesDataPoint, PopularDish, RecentOrder } from '@/types/dashboard'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

/**
 * 获取首页看板数据
 * GET /api/dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    const yesterdayStart = startOfDay(subDays(today, 1))
    const yesterdayEnd = endOfDay(subDays(today, 1))

    // 并行获取所有数据
    const [stats, salesChart, popularDishes, recentOrders] = await Promise.all([
      getDashboardStats(todayStart, todayEnd, yesterdayStart, yesterdayEnd),
      getTodaySalesChart(todayStart, todayEnd),
      getPopularDishes(todayStart, todayEnd, 5),
      getRecentOrders(10),
    ])

    const overview: DashboardOverview = {
      stats,
      salesChart,
      popularDishes,
      recentOrders,
    }

    return apiResponse.success(overview)
  } catch (error) {
    console.error('Get dashboard error:', error)
    return apiResponse.error(
      '获取首页数据失败',
      'INTERNAL_ERROR',
      500
    )
  }
}

/**
 * 获取首页统计数据
 */
async function getDashboardStats(
  todayStart: Date,
  todayEnd: Date,
  yesterdayStart: Date,
  yesterdayEnd: Date
): Promise<DashboardStats> {
  // 今日数据
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
      isPaid: true,
    },
    select: {
      totalPrice: true,
      tableId: true,
    },
  })

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const todayOrderCount = todayOrders.length
  const todayAvgOrder = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0

  // 昨日数据
  const yesterdayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
      isPaid: true,
    },
    select: {
      totalPrice: true,
    },
  })

  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const yesterdayOrderCount = yesterdayOrders.length
  const yesterdayAvgOrder = yesterdayOrderCount > 0 ? yesterdayRevenue / yesterdayOrderCount : 0

  // 计算翻台率（简化版：今日订单数 / 桌台总数）
  const totalTables = await prisma.table.count()
  const tablesTurnover = totalTables > 0 ? todayOrderCount / totalTables : 0

  const yesterdayTurnover = totalTables > 0 ? yesterdayOrderCount / totalTables : 0

  return {
    todayRevenue: Number(todayRevenue.toFixed(2)),
    todayOrders: todayOrderCount,
    avgOrderValue: Number(todayAvgOrder.toFixed(2)),
    tablesTurnover: Number(tablesTurnover.toFixed(1)),
    revenueChange: yesterdayRevenue > 0
      ? Number((((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(2))
      : 0,
    ordersChange: yesterdayOrderCount > 0
      ? Number((((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100).toFixed(2))
      : 0,
    avgOrderChange: yesterdayAvgOrder > 0
      ? Number((((todayAvgOrder - yesterdayAvgOrder) / yesterdayAvgOrder) * 100).toFixed(2))
      : 0,
    turnoverChange: yesterdayTurnover > 0
      ? Number((((tablesTurnover - yesterdayTurnover) / yesterdayTurnover) * 100).toFixed(2))
      : 0,
  }
}

/**
 * 获取今日销售趋势（按小时）
 */
async function getTodaySalesChart(todayStart: Date, todayEnd: Date): Promise<SalesDataPoint[]> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
      isPaid: true,
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  })

  // 按小时聚合
  const hourlyMap = new Map<number, number>()
  orders.forEach((order) => {
    const hour = order.createdAt.getHours()
    const existing = hourlyMap.get(hour) || 0
    hourlyMap.set(hour, existing + order.totalPrice)
  })

  // 生成当前时间之前的小时数据
  const currentHour = new Date().getHours()
  const result: SalesDataPoint[] = []

  for (let hour = 0; hour <= currentHour; hour++) {
    result.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      sales: Number((hourlyMap.get(hour) || 0).toFixed(2)),
    })
  }

  return result
}

/**
 * 获取今日热销菜品
 */
async function getPopularDishes(todayStart: Date, todayEnd: Date, limit: number): Promise<PopularDish[]> {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        isPaid: true,
      },
    },
    select: {
      dishId: true,
      quantity: true,
      unitPrice: true,
      dish: {
        select: {
          name: true,
        },
      },
    },
  })

  // 按菜品聚合
  const dishMap = new Map<string, { name: string; sales: number; revenue: number }>()

  orderItems.forEach((item) => {
    const existing = dishMap.get(item.dishId) || { name: item.dish.name, sales: 0, revenue: 0 }
    dishMap.set(item.dishId, {
      name: item.dish.name,
      sales: existing.sales + item.quantity,
      revenue: existing.revenue + (item.unitPrice * item.quantity),
    })
  })

  // 转换为数组并排序
  const dishes = Array.from(dishMap.entries())
    .map(([dishId, data]) => ({
      dishId,
      dishName: data.name,
      sales: data.sales,
      revenue: Number(data.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit)

  return dishes
}

/**
 * 获取最近订单
 */
async function getRecentOrders(limit: number): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      orderNo: true,
      tableId: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      table: {
        select: {
          number: true,
        },
      },
    },
  })

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNo,
    tableNumber: order.table?.number || null,
    totalPrice: Number(order.totalPrice.toFixed(2)),
    status: order.status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled',
    createdAt: order.createdAt.toISOString(),
  }))
}
