import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const hourlyData = [
  { time: "11:00-12:00", orders: 45, revenue: 3600, avgOrder: 80 },
  { time: "12:00-13:00", orders: 89, revenue: 7120, avgOrder: 80 },
  { time: "13:00-14:00", orders: 56, revenue: 4480, avgOrder: 80 },
  { time: "17:00-18:00", orders: 38, revenue: 3040, avgOrder: 80 },
  { time: "18:00-19:00", orders: 78, revenue: 6240, avgOrder: 80 },
  { time: "19:00-20:00", orders: 92, revenue: 7360, avgOrder: 80 },
  { time: "20:00-21:00", orders: 67, revenue: 5360, avgOrder: 80 },
]

export function HourlyAnalysis() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">时段分析</h3>
        <p className="text-sm text-[#6B7280] mt-1">各时段营业数据统计</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>时间段</TableHead>
            <TableHead className="text-right">订单数</TableHead>
            <TableHead className="text-right">营业额</TableHead>
            <TableHead className="text-right">客单价</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hourlyData.map((data) => (
            <TableRow key={data.time}>
              <TableCell className="font-medium">{data.time}</TableCell>
              <TableCell className="text-right text-[#6B7280]">{data.orders}</TableCell>
              <TableCell className="text-right font-semibold text-[#1E90FF]">¥{data.revenue}</TableCell>
              <TableCell className="text-right text-[#6B7280]">¥{data.avgOrder}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
