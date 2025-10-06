"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { date: "01/01", revenue: 12500, orders: 156, avgOrder: 80 },
  { date: "01/02", revenue: 15800, orders: 198, avgOrder: 80 },
  { date: "01/03", revenue: 18200, orders: 234, avgOrder: 78 },
  { date: "01/04", revenue: 16500, orders: 212, avgOrder: 78 },
  { date: "01/05", revenue: 19800, orders: 245, avgOrder: 81 },
  { date: "01/06", revenue: 22400, orders: 278, avgOrder: 81 },
  { date: "01/07", revenue: 20100, orders: 256, avgOrder: 78 },
]

export function RevenueChart() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">营业额趋势</h3>
        <p className="text-sm text-[#6B7280] mt-1">近7天营业额与订单数对比</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E6ED" />
          <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `¥${value / 1000}k`}
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
              if (name === "revenue") return [`¥${value}`, "营业额"]
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
