import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  {
    title: "今日营业额",
    value: "¥12,580",
    change: "+12.5%",
    icon: DollarSign,
    color: "#1E90FF",
  },
  {
    title: "今日订单",
    value: "156",
    change: "+8.2%",
    icon: ShoppingCart,
    color: "#28C76F",
  },
  {
    title: "客单价",
    value: "¥80.6",
    change: "+3.1%",
    icon: Users,
    color: "#FFB400",
  },
  {
    title: "翻台率",
    value: "3.2",
    change: "+15.3%",
    icon: TrendingUp,
    color: "#5A6B7B",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#6B7280] mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-[#333333]">{stat.value}</p>
                <p className="text-xs text-[#28C76F] mt-2">{stat.change} 较昨日</p>
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
