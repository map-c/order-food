"use client"

import { useState } from "react"
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
  const [selectedPayMethod, setSelectedPayMethod] = useState<"cash" | "card" | "alipay" | "wechat">("cash")
  const [dialogOpen, setDialogOpen] = useState(false)

  const selectedTable = tables.find((t) => t.id === selectedTableId)

  const handleSubmitOrder = async () => {
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
          payMethod: selectedPayMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("订单创建成功")
        clearCart()
        setDialogOpen(false)
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

  return (
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
                    <p className="text-sm font-semibold text-[#1E90FF] mt-1">¥{item.price}</p>
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
                  <span className="font-semibold text-[#333333]">¥{(item.price * item.quantity).toFixed(2)}</span>
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
                <span>¥{subtotal.toFixed(2)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-[#6B7280]">
                  <span>税费</span>
                  <span>¥{tax.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold text-[#333333]">
                <span>合计</span>
                <span className="text-[#1E90FF]">¥{total.toFixed(2)}</span>
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
                    提交订单 ¥{total.toFixed(2)}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>确认订单</DialogTitle>
                    <DialogDescription>请选择支付方式完成订单</DialogDescription>
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
                      <h4 className="font-semibold text-sm">支付方式</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={selectedPayMethod === "wechat" ? "default" : "outline"}
                          className="h-20 flex-col gap-2"
                          onClick={() => setSelectedPayMethod("wechat")}
                        >
                          <div className="h-8 w-8 rounded-lg bg-[#28C76F] flex items-center justify-center text-white font-bold">
                            微
                          </div>
                          <span className="text-sm">微信支付</span>
                        </Button>
                        <Button
                          variant={selectedPayMethod === "alipay" ? "default" : "outline"}
                          className="h-20 flex-col gap-2"
                          onClick={() => setSelectedPayMethod("alipay")}
                        >
                          <div className="h-8 w-8 rounded-lg bg-[#1E90FF] flex items-center justify-center text-white font-bold">
                            支
                          </div>
                          <span className="text-sm">支付宝</span>
                        </Button>
                        <Button
                          variant={selectedPayMethod === "cash" ? "default" : "outline"}
                          className="h-20 flex-col gap-2"
                          onClick={() => setSelectedPayMethod("cash")}
                        >
                          <div className="h-8 w-8 rounded-lg bg-[#FFB400] flex items-center justify-center text-white font-bold">
                            现
                          </div>
                          <span className="text-sm">现金支付</span>
                        </Button>
                        <Button
                          variant={selectedPayMethod === "card" ? "default" : "outline"}
                          className="h-20 flex-col gap-2"
                          onClick={() => setSelectedPayMethod("card")}
                        >
                          <div className="h-8 w-8 rounded-lg bg-[#5A6B7B] flex items-center justify-center text-white font-bold">
                            挂
                          </div>
                          <span className="text-sm">挂账</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "提交中..." : "确认下单"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
