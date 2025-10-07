"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDashboard } from "@/lib/hooks/use-dashboard"
import { format } from "date-fns"

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "待接单", color: "bg-[#EA5455] text-white" },
  confirmed: { label: "已接单", color: "bg-[#FFB400] text-white" },
  preparing: { label: "制作中", color: "bg-[#1E90FF] text-white" },
  ready: { label: "待取餐", color: "bg-[#9C27B0] text-white" },
  completed: { label: "已完成", color: "bg-[#28C76F] text-white" },
  cancelled: { label: "已取消", color: "bg-[#6B7280] text-white" },
}

export function RecentOrders() {
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="mb-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  const orders = data?.recentOrders || []

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
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[#6B7280] py-8">
                暂无订单
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                <TableCell className="font-medium">{order.tableNumber || '外带'}</TableCell>
                <TableCell className="font-semibold text-[#1E90FF]">
                  ¥{order.totalPrice.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[order.status]?.color || "bg-gray-500 text-white"}>
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#6B7280]">
                  {format(new Date(order.createdAt), 'HH:mm')}
                </TableCell>
                <TableCell className="text-right">
                  <button className="text-sm text-[#1E90FF] hover:underline">查看详情</button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
