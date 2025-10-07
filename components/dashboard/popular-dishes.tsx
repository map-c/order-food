"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useDashboard } from "@/lib/hooks/use-dashboard"

export function PopularDishes() {
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="mb-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  const dishes = data?.popularDishes || []

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">热销菜品</h3>
        <p className="text-sm text-[#6B7280] mt-1">今日销量排行</p>
      </div>
      <div className="space-y-4">
        {dishes.length === 0 ? (
          <p className="text-center text-[#6B7280] py-8">暂无数据</p>
        ) : (
          dishes.map((dish, index) => (
            <div key={dish.dishId} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  index === 0
                    ? "bg-[#1E90FF] text-white"
                    : index === 1
                      ? "bg-[#28C76F] text-white"
                      : index === 2
                        ? "bg-[#FFB400] text-white"
                        : "bg-[#F0F2F5] text-[#6B7280]"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#333333] truncate">{dish.dishName}</p>
                <p className="text-xs text-[#6B7280]">销量 {dish.sales} 份</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#333333]">¥{dish.revenue.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-[#28C76F]" />
                  <span className="text-xs text-[#28C76F]">热销</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
