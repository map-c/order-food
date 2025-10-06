"use client"

import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "热菜", value: 18500, color: "#1E90FF" },
  { name: "凉菜", value: 6200, color: "#28C76F" },
  { name: "主食", value: 8900, color: "#FFB400" },
  { name: "汤品", value: 4800, color: "#5A6B7B" },
  { name: "饮料", value: 3200, color: "#EA5455" },
]

export function CategoryChart() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">分类销售占比</h3>
        <p className="text-sm text-[#6B7280] mt-1">各类菜品销售额分布</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E0E6ED",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            formatter={(value: number) => [`¥${value}`, "销售额"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
