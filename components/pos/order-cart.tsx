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

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  note?: string
}

export function OrderCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: "宫保鸡丁", price: 38, quantity: 2 },
    { id: 2, name: "麻婆豆腐", price: 28, quantity: 1 },
    { id: 3, name: "米饭", price: 3, quantity: 2, note: "少盐" },
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.06
  const total = subtotal + tax

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#333333]">当前订单</h3>
          <Button variant="ghost" size="sm" onClick={clearCart} className="h-8 text-[#EA5455] hover:text-[#EA5455]">
            <Trash2 className="h-4 w-4 mr-1" />
            清空
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <ShoppingCart className="h-4 w-4" />
          <span>桌号: A-01</span>
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
              <div key={item.id} className="bg-muted rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#333333] text-sm truncate">{item.name}</h4>
                    <p className="text-sm font-semibold text-[#1E90FF] mt-1">¥{item.price}</p>
                    {item.note && <p className="text-xs text-[#6B7280] mt-1">备注: {item.note}</p>}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[#EA5455] hover:text-[#EA5455]/80 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => updateQuantity(item.id, 1)}
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
              <div className="flex justify-between text-[#6B7280]">
                <span>税费 (6%)</span>
                <span>¥{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-[#333333]">
                <span>合计</span>
                <span className="text-[#1E90FF]">¥{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea placeholder="订单备注（选填）" className="resize-none h-16 text-sm" />

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white font-semibold text-base">
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
                          <span className="font-medium">A-01</span>
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
                        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                          <div className="h-8 w-8 rounded-lg bg-[#28C76F] flex items-center justify-center text-white font-bold">
                            微
                          </div>
                          <span className="text-sm">微信支付</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                          <div className="h-8 w-8 rounded-lg bg-[#1E90FF] flex items-center justify-center text-white font-bold">
                            支
                          </div>
                          <span className="text-sm">支付宝</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                          <div className="h-8 w-8 rounded-lg bg-[#FFB400] flex items-center justify-center text-white font-bold">
                            现
                          </div>
                          <span className="text-sm">现金支付</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                          <div className="h-8 w-8 rounded-lg bg-[#5A6B7B] flex items-center justify-center text-white font-bold">
                            挂
                          </div>
                          <span className="text-sm">挂账</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">取消</Button>
                    <Button className="bg-[#1E90FF] hover:bg-[#1E90FF]/90">确认支付</Button>
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
