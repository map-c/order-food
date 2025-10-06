import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const orders = [
  {
    id: "ORD-20250105-001",
    table: "A-05",
    amount: "¥186",
    status: "completed",
    time: "12:35",
  },
  {
    id: "ORD-20250105-002",
    table: "B-12",
    amount: "¥245",
    status: "cooking",
    time: "12:42",
  },
  {
    id: "ORD-20250105-003",
    table: "外带",
    amount: "¥98",
    status: "pending",
    time: "12:48",
  },
  {
    id: "ORD-20250105-004",
    table: "C-08",
    amount: "¥312",
    status: "cooking",
    time: "12:52",
  },
  {
    id: "ORD-20250105-005",
    table: "A-03",
    amount: "¥156",
    status: "completed",
    time: "13:05",
  },
]

const statusConfig = {
  completed: { label: "已完成", color: "bg-[#28C76F] text-white" },
  cooking: { label: "制作中", color: "bg-[#FFB400] text-white" },
  pending: { label: "待支付", color: "bg-[#EA5455] text-white" },
}

export function RecentOrders() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">最近订单</h3>
        <p className="text-sm text-[#6B7280] mt-1">实时订单动态</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>桌号</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.id}</TableCell>
              <TableCell className="font-medium">{order.table}</TableCell>
              <TableCell className="font-semibold text-[#1E90FF]">{order.amount}</TableCell>
              <TableCell>
                <Badge className={statusConfig[order.status as keyof typeof statusConfig].color}>
                  {statusConfig[order.status as keyof typeof statusConfig].label}
                </Badge>
              </TableCell>
              <TableCell className="text-[#6B7280]">{order.time}</TableCell>
              <TableCell className="text-right">
                <button className="text-sm text-[#1E90FF] hover:underline">查看详情</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
