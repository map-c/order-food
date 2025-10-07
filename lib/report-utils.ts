import { prisma } from '@/lib/prisma'
import type { ReportStats } from '@/types/reports'

/**
 * 获取报表统计数据
 */
export async function getReportStats(
  startDate: Date,
  endDate: Date,
  compareStartDate?: Date,
  compareEndDate?: Date
): Promise<ReportStats> {
  // 获取当前期间数据
  const currentOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isPaid: true,
    },
    select: {
      totalPrice: true,
    },
  })

  const totalRevenue = currentOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const totalOrders = currentOrders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // 简化的利润率计算（实际应该基于成本数据）
  const profitRate = 0.583 // 58.3% 固定值，实际项目中应该从成本表计算

  const stats: ReportStats = {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
    profitRate,
  }

  // 如果提供了对比期，计算增长率
  if (compareStartDate && compareEndDate) {
    const compareOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: compareStartDate,
          lte: compareEndDate,
        },
        isPaid: true,
      },
      select: {
        totalPrice: true,
      },
    })

    const compareRevenue = compareOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    const compareCount = compareOrders.length
    const compareAvgOrder = compareCount > 0 ? compareRevenue / compareCount : 0

    stats.comparison = {
      revenueGrowth: compareRevenue > 0
        ? Number((((totalRevenue - compareRevenue) / compareRevenue) * 100).toFixed(2))
        : 0,
      ordersGrowth: compareCount > 0
        ? Number((((totalOrders - compareCount) / compareCount) * 100).toFixed(2))
        : 0,
      avgOrderGrowth: compareAvgOrder > 0
        ? Number((((avgOrderValue - compareAvgOrder) / compareAvgOrder) * 100).toFixed(2))
        : 0,
    }
  }

  return stats
}

/**
 * 计算增长率
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

/**
 * 格式化货币
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * 验证日期范围
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate
}

/**
 * 获取日期范围天数
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
