"use client"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Percent } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useReportContext } from "@/lib/report-context"
import { useReportOverview } from "@/lib/hooks/use-reports"
import { formatCurrency, formatPercent } from "@/lib/report-utils"

export function ReportStats() {
  const { filters } = useReportContext()
  const { data, isLoading } = useReportOverview(filters)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 shadow-card animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </Card>
        ))}
      </div>
    )
  }

  if (!data?.stats) {
    return null
  }

  const stats = [
    {
      title: "总营业额",
      value: formatCurrency(data.stats.totalRevenue),
      change: data.stats.comparison?.revenueGrowth,
      icon: DollarSign,
      color: "#1E90FF",
    },
    {
      title: "订单总数",
      value: data.stats.totalOrders.toString(),
      change: data.stats.comparison?.ordersGrowth,
      icon: ShoppingCart,
      color: "#28C76F",
    },
    {
      title: "客单价",
      value: formatCurrency(data.stats.avgOrderValue),
      change: data.stats.comparison?.avgOrderGrowth,
      icon: Users,
      color: "#FFB400",
    },
    {
      title: "利润率",
      value: formatPercent(data.stats.profitRate * 100),
      change: undefined,
      icon: Percent,
      color: "#5A6B7B",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const hasChange = stat.change !== undefined
        const trend = hasChange && stat.change > 0 ? "up" : "down"
        const TrendIcon = trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card key={stat.title} className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              {hasChange && stat.change !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${trend === "up" ? "text-[#28C76F]" : "text-[#EA5455]"}`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-sm text-[#6B7280] mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-[#333333]">{stat.value}</p>
          </Card>
        )
      })}
    </div>
  )
}
