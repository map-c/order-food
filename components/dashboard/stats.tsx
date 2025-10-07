"use client"

import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useDashboard } from "@/lib/hooks/use-dashboard"
import { formatCurrency } from "@/lib/report-utils"

export function DashboardStats() {
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 shadow-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "今日营业额",
      value: formatCurrency(data?.stats.todayRevenue || 0),
      change: data?.stats.revenueChange || 0,
      icon: DollarSign,
      color: "#1E90FF",
    },
    {
      title: "今日订单",
      value: (data?.stats.todayOrders || 0).toString(),
      change: data?.stats.ordersChange || 0,
      icon: ShoppingCart,
      color: "#28C76F",
    },
    {
      title: "客单价",
      value: formatCurrency(data?.stats.avgOrderValue || 0),
      change: data?.stats.avgOrderChange || 0,
      icon: Users,
      color: "#FFB400",
    },
    {
      title: "翻台率",
      value: (data?.stats.tablesTurnover || 0).toFixed(1),
      change: data?.stats.turnoverChange || 0,
      icon: TrendingUp,
      color: "#5A6B7B",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.change >= 0
        return (
          <Card key={stat.title} className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#6B7280] mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-[#333333]">{stat.value}</p>
                <p className={`text-xs mt-2 ${isPositive ? 'text-[#28C76F]' : 'text-[#EA5455]'}`}>
                  {isPositive ? '+' : ''}{stat.change.toFixed(1)}% 较昨日
                </p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
