"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { Eye, Printer, XCircle, MoreVertical, Loader2 } from "lucide-react"
import { format, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { fetcher, apiClient } from "@/lib/api-client"
import type { Order, OrderListResponse, OrderPayMethod, OrderStatus } from "@/types/api"
import type { OrderFilterState, OrderDatePreset } from "./order-filters"

interface OrderListProps {
  filters: OrderFilterState
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "待支付", color: "bg-[#EA5455] text-white" },
  confirmed: { label: "已确认", color: "bg-[#1E90FF] text-white" },
  preparing: { label: "制作中", color: "bg-[#FFB400] text-white" },
  ready: { label: "待取餐", color: "bg-[#845EC2] text-white" },
  completed: { label: "已完成", color: "bg-[#28C76F] text-white" },
  cancelled: { label: "已取消", color: "bg-[#6B7280] text-white" },
}

const PAY_METHOD_LABEL: Record<OrderPayMethod, string> = {
  cash: "现金",
  card: "刷卡",
  alipay: "支付宝",
  wechat: "微信支付",
}

const PAY_METHOD_ENTRIES = Object.entries(PAY_METHOD_LABEL) as Array<[OrderPayMethod, string]>

function getDateRange(preset: OrderDatePreset) {
  const now = new Date()

  switch (preset) {
    case "today":
      return {
        startDate: startOfDay(now).toISOString(),
        endDate: endOfDay(now).toISOString(),
      }
    case "yesterday": {
      const yesterday = subDays(now, 1)
      return {
        startDate: startOfDay(yesterday).toISOString(),
        endDate: endOfDay(yesterday).toISOString(),
      }
    }
    case "week":
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        endDate: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      }
    case "month":
      return {
        startDate: startOfMonth(now).toISOString(),
        endDate: endOfMonth(now).toISOString(),
      }
    case "all":
    default:
      return {
        startDate: undefined,
        endDate: undefined,
      }
  }
}

function formatCurrency(amount: number) {
  return amount.toFixed(2)
}

function getPaymentLabel(order: Order) {
  if (order.payMethod) {
    return PAY_METHOD_LABEL[order.payMethod]
  }
  return order.isPaid ? "已支付" : "待支付"
}

export function OrderList({ filters }: OrderListProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completionPayMethod, setCompletionPayMethod] = useState<OrderPayMethod | "">("")
  const [completionPaidAmount, setCompletionPaidAmount] = useState<string>("")

  const { startDate, endDate } = useMemo(() => getDateRange(filters.datePreset), [filters.datePreset])

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()

    if (filters.status !== "all") {
      params.append("status", filters.status)
    }

    if (startDate) {
      params.append("startDate", startDate)
    }

    if (endDate) {
      params.append("endDate", endDate)
    }

    const queryString = params.toString()
    return queryString ? `/api/orders?${queryString}` : "/api/orders"
  }, [filters.status, startDate, endDate])

  const { data, error, isLoading, mutate } = useSWR<OrderListResponse>(apiUrl, fetcher)
  const orders = data?.orders ?? []

  const filteredOrders = useMemo(() => {
    if (!filters.search) return orders
    const keyword = filters.search.trim().toLowerCase()
    if (!keyword) return orders

    return orders.filter((order) => {
      const orderNoMatch = order.orderNo.toLowerCase().includes(keyword)
      const tableMatch = order.table?.number?.toLowerCase().includes(keyword)
      return orderNoMatch || tableMatch
    })
  }, [orders, filters.search])

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return orders.find((order) => order.id === selectedOrderId) || null
  }, [orders, selectedOrderId])

  useEffect(() => {
    if (selectedOrder) {
      setCompletionPayMethod(selectedOrder.payMethod ?? "")

      const initialAmount =
        selectedOrder.paidAmount && selectedOrder.paidAmount > 0
          ? selectedOrder.paidAmount
          : selectedOrder.totalPrice

      setCompletionPaidAmount(initialAmount ? formatCurrency(initialAmount) : "")
    } else {
      setCompletionPayMethod("")
      setCompletionPaidAmount("")
    }
  }, [selectedOrder])

  const handleViewDetails = (order: Order) => {
    setSelectedOrderId(order.id)
    setDetailsOpen(true)
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setDetailsOpen(open)
    if (!open) {
      setSelectedOrderId(null)
      setCancellingId(null)
      setCompletingId(null)
    }
  }

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return
    if (!completionPayMethod) {
      toast.error("请选择支付方式")
      return
    }

    const amountValue = Number(completionPaidAmount)
    if (Number.isNaN(amountValue) || amountValue < 0) {
      toast.error("请输入有效的实付金额")
      return
    }

    setCompletingId(selectedOrder.id)
    try {
      const updated = await apiClient.patch<Order>(`/api/orders/${selectedOrder.id}/status`, {
        status: "completed",
        payMethod: completionPayMethod,
        paidAmount: amountValue,
        isPaid: true,
      })

      toast.success("订单已完成")
      setCompletionPayMethod(updated.payMethod ?? "")
      setCompletionPaidAmount(formatCurrency(updated.paidAmount ?? amountValue))
      await mutate()
    } catch (err: any) {
      toast.error(err?.message || "完成订单失败")
    } finally {
      setCompletingId(null)
    }
  }

  const handleCancelOrder = async (order: Order) => {
    if (cancellingId) return

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`确定要取消订单 ${order.orderNo} 吗？`)
      if (!confirmed) {
        return
      }
    }

    setCancellingId(order.id)
    try {
      await apiClient.delete<null>(`/api/orders/${order.id}`)
      toast.success("订单已取消")
      setDetailsOpen(false)
      setSelectedOrderId(null)
      await mutate()
    } catch (err: any) {
      toast.error(err?.message || "取消订单失败")
    } finally {
      setCancellingId(null)
    }
  }

  if (error) {
    return (
      <Card className="shadow-card p-8 text-center">
        <p className="text-[#EA5455]">加载订单失败：{error.message}</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="shadow-card p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#1E90FF]" />
        <p className="text-[#6B7280] mt-2">订单数据加载中...</p>
      </Card>
    )
  }

  if (filteredOrders.length === 0) {
    return (
      <Card className="shadow-card p-8 text-center">
        <p className="text-[#6B7280]">暂无符合条件的订单</p>
      </Card>
    )
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
              <TableHead>实付金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead>下单时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status as OrderStatus]
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const orderTime = format(new Date(order.createdAt), "HH:mm")

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNo}</TableCell>
                  <TableCell className="font-medium">{order.table?.number ?? "-"}</TableCell>
                  <TableCell>{itemCount} 份</TableCell>
                  <TableCell className="font-semibold text-[#1E90FF]">¥{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell className="text-[#333333]">¥{formatCurrency(order.paidAmount ?? 0)}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  </TableCell>
                  <TableCell className="text-[#6B7280]">{getPaymentLabel(order)}</TableCell>
                  <TableCell className="text-[#6B7280]">{orderTime}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault()
                            handleViewDetails(order)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                          <Printer className="mr-2 h-4 w-4" />
                          打印订单
                        </DropdownMenuItem>
                        {order.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-[#EA5455]"
                              disabled={cancellingId === order.id}
                              onSelect={(event) => {
                                event.preventDefault()
                                handleCancelOrder(order)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {cancellingId === order.id ? "取消中..." : "取消订单"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={handleDetailsOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>查看订单的完整信息</DialogDescription>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">订单号</p>
                  <p className="font-mono font-semibold">{selectedOrder.orderNo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">桌号</p>
                  <p className="font-semibold">{selectedOrder.table?.number ?? "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">下单时间</p>
                  <p className="font-semibold">{format(new Date(selectedOrder.createdAt), "yyyy-MM-dd HH:mm")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">订单状态</p>
                  <Badge className={STATUS_CONFIG[selectedOrder.status].color}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#6B7280]">支付状态</p>
                  <p className="font-semibold">{getPaymentLabel(selectedOrder)}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-[#6B7280]">备注</p>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">结算信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#333333]">支付方式</Label>
                    <Select
                      value={completionPayMethod || undefined}
                      onValueChange={(value) => setCompletionPayMethod(value as OrderPayMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择支付方式" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_METHOD_ENTRIES.map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#333333]">实付金额 (¥)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={completionPaidAmount}
                      onChange={(event) => setCompletionPaidAmount(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">订单菜品</h4>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.dish?.name ?? "未知菜品"}</p>
                        <p className="text-sm text-[#6B7280]">
                          ¥{formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[#1E90FF]">¥{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">总计</span>
                  <span>¥{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">已付金额</span>
                  <span>¥{formatCurrency(selectedOrder.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[#6B7280]">支付方式</span>
                  <span className="font-medium">{getPaymentLabel(selectedOrder)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Printer className="mr-2 h-4 w-4" />
                  打印订单
                </Button>
                {selectedOrder.status === "pending" && (
                  <Button
                    variant="outline"
                    className="flex-1 text-[#EA5455] hover:text-[#EA5455] bg-transparent"
                    disabled={cancellingId === selectedOrder.id}
                    onClick={() => handleCancelOrder(selectedOrder)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {cancellingId === selectedOrder.id ? "取消中..." : "取消订单"}
                  </Button>
                )}
                {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                  <Button
                    className="flex-1"
                    onClick={handleCompleteOrder}
                    disabled={
                      completingId === selectedOrder.id ||
                      !completionPayMethod ||
                      completionPaidAmount.trim() === "" ||
                      Number.isNaN(Number(completionPaidAmount)) ||
                      Number(completionPaidAmount) < 0
                    }
                  >
                    {completingId === selectedOrder.id ? "完成中..." : "完成订单"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[#6B7280]">无法找到订单详情，请重试。</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
