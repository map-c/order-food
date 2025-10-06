"use client"

import { useState } from "react"
import { Eye, Printer, XCircle, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const orders = [
  {
    id: "ORD-20250105-001",
    table: "A-05",
    items: [
      { name: "宫保鸡丁", quantity: 2, price: 38 },
      { name: "米饭", quantity: 2, price: 3 },
    ],
    amount: 82,
    status: "completed",
    time: "12:35",
    paymentMethod: "微信支付",
  },
  {
    id: "ORD-20250105-002",
    table: "B-12",
    items: [
      { name: "麻婆豆腐", quantity: 1, price: 28 },
      { name: "鱼香肉丝", quantity: 1, price: 32 },
      { name: "米饭", quantity: 2, price: 3 },
    ],
    amount: 66,
    status: "cooking",
    time: "12:42",
    paymentMethod: "支付宝",
  },
  {
    id: "ORD-20250105-003",
    table: "外带",
    items: [
      { name: "糖醋里脊", quantity: 1, price: 42 },
      { name: "可乐", quantity: 1, price: 6 },
    ],
    amount: 48,
    status: "pending",
    time: "12:48",
    paymentMethod: "待支付",
  },
  {
    id: "ORD-20250105-004",
    table: "C-08",
    items: [
      { name: "回锅肉", quantity: 2, price: 36 },
      { name: "凉拌黄瓜", quantity: 1, price: 12 },
      { name: "米饭", quantity: 3, price: 3 },
    ],
    amount: 93,
    status: "cooking",
    time: "12:52",
    paymentMethod: "现金",
  },
  {
    id: "ORD-20250105-005",
    table: "A-03",
    items: [
      { name: "宫保鸡丁", quantity: 1, price: 38 },
      { name: "西红柿蛋汤", quantity: 1, price: 15 },
      { name: "米饭", quantity: 1, price: 3 },
    ],
    amount: 56,
    status: "completed",
    time: "13:05",
    paymentMethod: "微信支付",
  },
  {
    id: "ORD-20250105-006",
    table: "B-08",
    items: [
      { name: "麻婆豆腐", quantity: 2, price: 28 },
      { name: "皮蛋豆腐", quantity: 1, price: 16 },
    ],
    amount: 72,
    status: "cancelled",
    time: "13:12",
    paymentMethod: "已取消",
  },
]

const statusConfig = {
  completed: { label: "已完成", color: "bg-[#28C76F] text-white" },
  cooking: { label: "制作中", color: "bg-[#FFB400] text-white" },
  pending: { label: "待支付", color: "bg-[#EA5455] text-white" },
  cancelled: { label: "已取消", color: "bg-[#6B7280] text-white" },
}

export function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleViewDetails = (order: (typeof orders)[0]) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  return (
    <>
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>桌号</TableHead>
              <TableHead>菜品数量</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell className="font-medium">{order.table}</TableCell>
                <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} 份</TableCell>
                <TableCell className="font-semibold text-[#1E90FF]">¥{order.amount}</TableCell>
                <TableCell>
                  <Badge className={statusConfig[order.status as keyof typeof statusConfig].color}>
                    {statusConfig[order.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#6B7280]">{order.paymentMethod}</TableCell>
                <TableCell className="text-[#6B7280]">{order.time}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        打印订单
                      </DropdownMenuItem>
                      {order.status !== "cancelled" && order.status !== "completed" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-[#EA5455]">
                            <XCircle className="mr-2 h-4 w-4" />
                            取消订单
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>查看订单的完整信息</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">订单号</p>
                  <p className="font-mono font-semibold">{selectedOrder.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">桌号</p>
                  <p className="font-semibold">{selectedOrder.table}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">下单时间</p>
                  <p className="font-semibold">{selectedOrder.time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">订单状态</p>
                  <Badge className={statusConfig[selectedOrder.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-semibold">订单菜品</h4>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[#6B7280]">
                          ¥{item.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[#1E90FF]">¥{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">小计</span>
                  <span>¥{selectedOrder.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">税费</span>
                  <span>¥0</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>合计</span>
                  <span className="text-[#1E90FF]">¥{selectedOrder.amount}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[#6B7280]">支付方式</span>
                  <span className="font-medium">{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Printer className="mr-2 h-4 w-4" />
                  打印订单
                </Button>
                {selectedOrder.status !== "cancelled" && selectedOrder.status !== "completed" && (
                  <Button variant="outline" className="flex-1 text-[#EA5455] hover:text-[#EA5455] bg-transparent">
                    <XCircle className="mr-2 h-4 w-4" />
                    取消订单
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
