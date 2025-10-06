import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const topDishes = [
  { rank: 1, name: "宫保鸡丁", sales: 245, revenue: 9310, growth: 12.5 },
  { rank: 2, name: "麻婆豆腐", sales: 198, revenue: 5544, growth: 8.2 },
  { rank: 3, name: "鱼香肉丝", sales: 176, revenue: 5632, growth: 15.3 },
  { rank: 4, name: "糖醋里脊", sales: 142, revenue: 5964, growth: -3.2 },
  { rank: 5, name: "回锅肉", sales: 134, revenue: 4824, growth: 6.8 },
]

export function TopDishes() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">热销菜品 TOP 5</h3>
        <p className="text-sm text-[#6B7280] mt-1">销量最高的菜品排行</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">排名</TableHead>
            <TableHead>菜品名称</TableHead>
            <TableHead className="text-right">销量</TableHead>
            <TableHead className="text-right">营业额</TableHead>
            <TableHead className="text-right">增长率</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topDishes.map((dish) => (
            <TableRow key={dish.rank}>
              <TableCell>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                    dish.rank === 1
                      ? "bg-[#1E90FF] text-white"
                      : dish.rank === 2
                        ? "bg-[#28C76F] text-white"
                        : dish.rank === 3
                          ? "bg-[#FFB400] text-white"
                          : "bg-[#F0F2F5] text-[#6B7280]"
                  }`}
                >
                  {dish.rank}
                </div>
              </TableCell>
              <TableCell className="font-medium">{dish.name}</TableCell>
              <TableCell className="text-right text-[#6B7280]">{dish.sales} 份</TableCell>
              <TableCell className="text-right font-semibold text-[#1E90FF]">¥{dish.revenue}</TableCell>
              <TableCell className="text-right">
                <span className={`font-medium ${dish.growth >= 0 ? "text-[#28C76F]" : "text-[#EA5455]"}`}>
                  {dish.growth >= 0 ? "+" : ""}
                  {dish.growth}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
