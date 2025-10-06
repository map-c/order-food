import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Percent } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  {
    title: "总营业额",
    value: "¥45,680",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "#1E90FF",
  },
  {
    title: "订单总数",
    value: "568",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "#28C76F",
  },
  {
    title: "客单价",
    value: "¥80.4",
    change: "+3.1%",
    trend: "up",
    icon: Users,
    color: "#FFB400",
  },
  {
    title: "利润率",
    value: "58.3%",
    change: "-2.4%",
    trend: "down",
    icon: Percent,
    color: "#5A6B7B",
  },
]

export function ReportStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
        return (
          <Card key={stat.title} className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-[#28C76F]" : "text-[#EA5455]"}`}
              >
                <TrendIcon className="h-4 w-4" />
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-[#333333]">{stat.value}</p>
          </Card>
        )
      })}
    </div>
  )
}
