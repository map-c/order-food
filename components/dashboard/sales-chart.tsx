"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useDashboard } from "@/lib/hooks/use-dashboard"

export function SalesChart() {
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
      </Card>
    )
  }

  const chartData = data?.salesChart || []

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">今日销售趋势</h3>
        <p className="text-sm text-[#6B7280] mt-1">实时营业额变化</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E6ED" />
          <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `¥${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E0E6ED",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            formatter={(value: number) => [`¥${value.toFixed(2)}`, "销售额"]}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#1E90FF"
            strokeWidth={2}
            dot={{ fill: "#1E90FF", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
