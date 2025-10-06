"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePOS } from "@/lib/contexts/pos-context"
import { useTables } from "@/lib/hooks/use-tables"
import { toast } from "sonner"
import type { Order } from "@/types/api"

const formatCurrency = (value: number) => value.toFixed(2)

export function OrderCart() {
  const {
    selectedTableId,
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    orderNotes,
    setOrderNotes,
    subtotal,
    tax,
    total,
  } = usePOS()

  const { tables } = useTables()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null)

  const selectedTable = tables.find((t) => t.id === selectedTableId)
  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const handleSubmitOrder = async (options?: { print?: boolean }) => {
    if (!selectedTableId) {
      toast.error("请先选择桌台")
      return
    }

    if (cartItems.length === 0) {
      toast.error("购物车为空")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: selectedTableId,
          items: cartItems.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            notes: item.notes,
          })),
          notes: orderNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const createdOrder: Order = data.data
        toast.success("订单创建成功")
        setPrintableOrder(createdOrder)
        clearCart()
        setDialogOpen(false)
        if (options?.print && typeof window !== "undefined") {
          setTimeout(() => {
            window.print()
          }, 50)
        }
      } else {
        toast.error(data.error?.message || "订单创建失败")
      }
    } catch (error) {
      console.error("提交订单失败:", error)
      toast.error("订单创建失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentLabelMap: Record<string, string> = {
    cash: "现金",
    card: "刷卡",
    alipay: "支付宝",
    wechat: "微信支付",
  }

  const receiptPaymentText = printableOrder
    ? printableOrder.payMethod
      ? paymentLabelMap[printableOrder.payMethod] ?? printableOrder.payMethod
      : printableOrder.isPaid
        ? "已支付"
        : "待支付"
    : "待支付"

  return (
    <>
      <style jsx global>{`
        #printable-receipt {
          display: none;
        }
        @media print {
          body {
            margin: 0;
            font-size: 12px;
            background: #ffffff;
          }
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            display: block;
            position: absolute;
            inset: 0;
            padding: 24px;
            background: #ffffff;
          }
          #printable-receipt .receipt-container {
            width: 320px;
            margin: 0 auto;
            font-family: "Helvetica", "Arial", sans-serif;
          }
          #printable-receipt .receipt-items {
            max-height: none;
            overflow: visible;
          }
        }
      `}</style>

      <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#333333]">当前订单</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="h-8 text-[#EA5455] hover:text-[#EA5455]"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清空
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <ShoppingCart className="h-4 w-4" />
          <span>
            {selectedTableId === "takeout"
              ? "外带订单"
              : selectedTable
                ? `桌号: ${selectedTable.number}`
                : "未选择桌台"}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ShoppingCart className="h-12 w-12 text-[#E0E6ED] mb-3" />
            <p className="text-sm text-[#6B7280]">购物车为空</p>
            <p className="text-xs text-[#6B7280] mt-1">请选择菜品添加到订单</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.dishId} className="bg-muted rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#333333] text-sm truncate">{item.name}</h4>
                    <p className="text-sm font-semibold text-[#1E90FF] mt-1">¥{formatCurrency(Number(item.price))}</p>
                    {item.notes && <p className="text-xs text-[#6B7280] mt-1">备注: {item.notes}</p>}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.dishId)}
                    className="text-[#EA5455] hover:text-[#EA5455]/80 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => updateQuantity(item.dishId, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => updateQuantity(item.dishId, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-semibold text-[#333333]">¥{formatCurrency(Number(item.price) * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <>
          <Separator />
          <div className="p-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#6B7280]">
                <span>小计</span>
                <span>¥{formatCurrency(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-[#6B7280]">
                  <span>税费</span>
                  <span>¥{formatCurrency(tax)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold text-[#333333]">
                <span>合计</span>
                <span className="text-[#1E90FF]">¥{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="订单备注（选填）"
                className="resize-none h-16 text-sm"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full h-12 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white font-semibold text-base"
                  disabled={!selectedTableId}
                >
                    提交订单 ¥{formatCurrency(total)}
                </Button>
              </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>确认订单</DialogTitle>
                    <DialogDescription>确认订单信息后将自动打印小票</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">订单信息</h4>
                      <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">桌号</span>
                          <span className="font-medium">
                            {selectedTableId === "takeout" ? "外带" : selectedTable?.number || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">菜品数量</span>
                          <span className="font-medium">
                            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} 份
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">订单金额</span>
                          <span className="font-semibold text-[#1E90FF]">¥{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">菜品明细</h4>
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {cartItems.map((item) => (
                          <div key={item.dishId} className="border rounded-lg p-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-[#333333]">{item.name}</span>
                              <span className="font-semibold text-[#1E90FF]">¥{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-[#6B7280]">
                              <span>单价 ¥{Number(item.price).toFixed(2)}</span>
                              <span>数量 ×{item.quantity}</span>
                            </div>
                            {item.notes && (
                              <p className="mt-1 text-xs text-[#6B7280]">备注：{item.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
                      onClick={() => handleSubmitOrder({ print: true })}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "提交中..." : "确认并打印"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}

      </div>

      <div id="printable-receipt">
        {printableOrder && (
          <div className="receipt-container">
            <div className="text-center">
              <h2 className="text-lg font-bold">美味餐厅</h2>
              <p className="text-xs text-[#6B7280] mt-1">
                {format(new Date(printableOrder.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </p>
            </div>

            <div className="mt-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">订单号</span>
                <span className="font-semibold">{printableOrder.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">桌号</span>
                <span className="font-semibold">{printableOrder.table?.number ?? "外带"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">支付状态</span>
                <span className="font-semibold">{receiptPaymentText}</span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">菜品明细</h3>
              <div className="receipt-items space-y-2">
                {printableOrder.items.map((item) => (
                  <div key={item.id} className="border-b border-dashed pb-2 text-sm">
                    <div className="flex justify-between">
                      <span>{item.dish?.name ?? "未知菜品"}</span>
                      <span>¥{formatCurrency(item.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                      <span>¥{formatCurrency(item.unitPrice)} × {item.quantity}</span>
                      {item.notes && <span>备注：{item.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">合计</span>
                <span className="font-semibold">¥{formatCurrency(printableOrder.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">已付金额</span>
                <span className="font-semibold">¥{formatCurrency(printableOrder.paidAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">订单备注</span>
                <span className="max-w-[180px] text-right">
                  {printableOrder.notes ?? "无"}
                </span>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-[#6B7280]">感谢惠顾，欢迎再次光临</p>
          </div>
        )}
      </div>
    </>
  )
}
