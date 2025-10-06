import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const dishes = [
  { name: "宫保鸡丁", sales: 45, revenue: "¥1,350", trend: "up" },
  { name: "麻婆豆腐", sales: 38, revenue: "¥1,140", trend: "up" },
  { name: "鱼香肉丝", sales: 32, revenue: "¥960", trend: "up" },
  { name: "糖醋里脊", sales: 28, revenue: "¥1,120", trend: "down" },
  { name: "回锅肉", sales: 25, revenue: "¥1,000", trend: "up" },
]

export function PopularDishes() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">热销菜品</h3>
        <p className="text-sm text-[#6B7280] mt-1">今日销量排行</p>
      </div>
      <div className="space-y-4">
        {dishes.map((dish, index) => (
          <div key={dish.name} className="flex items-center gap-3">
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
              <p className="text-sm font-medium text-[#333333] truncate">{dish.name}</p>
              <p className="text-xs text-[#6B7280]">销量 {dish.sales} 份</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#333333]">{dish.revenue}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-[#28C76F]" />
                <span className="text-xs text-[#28C76F]">热销</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
