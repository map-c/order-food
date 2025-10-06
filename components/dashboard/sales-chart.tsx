"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { time: "09:00", sales: 1200 },
  { time: "10:00", sales: 1800 },
  { time: "11:00", sales: 3200 },
  { time: "12:00", sales: 5600 },
  { time: "13:00", sales: 4800 },
  { time: "14:00", sales: 2400 },
  { time: "15:00", sales: 1600 },
  { time: "16:00", sales: 1200 },
  { time: "17:00", sales: 2800 },
  { time: "18:00", sales: 4200 },
  { time: "19:00", sales: 6400 },
  { time: "20:00", sales: 5200 },
]

export function SalesChart() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">今日销售趋势</h3>
        <p className="text-sm text-[#6B7280] mt-1">实时营业额变化</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
            formatter={(value: number) => [`¥${value}`, "销售额"]}
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
