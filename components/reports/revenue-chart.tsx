"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { useReportContext } from "@/lib/report-context"
import { useReportOverview } from "@/lib/hooks/use-reports"
import { format } from "date-fns"

export function RevenueChart() {
  const { filters } = useReportContext()
  const { data, isLoading } = useReportOverview(filters)

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-[320px] bg-gray-100 rounded animate-pulse" />
      </Card>
    )
  }

  const chartData = data?.revenueChart?.map((item) => ({
    date: format(new Date(item.date), 'MM/dd'),
    revenue: item.revenue,
    orders: item.orders,
  })) || []

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">营业额趋势</h3>
        <p className="text-sm text-[#6B7280] mt-1">营业额与订单数对比</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E6ED" />
          <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `¥${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
          />
          <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E0E6ED",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            formatter={(value: number, name: string) => {
              if (name === "revenue") return [`¥${value.toFixed(2)}`, "营业额"]
              if (name === "orders") return [value, "订单数"]
              return [value, name]
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => {
              if (value === "revenue") return "营业额"
              if (value === "orders") return "订单数"
              return value
            }}
          />
          <Bar yAxisId="left" dataKey="revenue" fill="#1E90FF" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="orders" fill="#28C76F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
