"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { toast } from "sonner"

export interface CartItem {
  dishId: string
  name: string
  price: number
  quantity: number
  image: string
  notes?: string
}

interface POSContextType {
  // 选中的桌台
  selectedTableId: string | null
  setSelectedTableId: (tableId: string | null) => void

  // 购物车
  cartItems: CartItem[]
  addToCart: (dish: { id: string; name: string; price: number; image: string }) => void
  removeFromCart: (dishId: string) => void
  updateQuantity: (dishId: string, delta: number) => void
  updateNotes: (dishId: string, notes: string) => void
  clearCart: () => void

  // 订单备注
  orderNotes: string
  setOrderNotes: (notes: string) => void

  // 计算
  subtotal: number
  tax: number
  total: number
}

const POSContext = createContext<POSContextType | undefined>(undefined)

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")

  // 添加到购物车
  const addToCart = useCallback((dish: { id: string; name: string; price: number; image: string }) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.dishId === dish.id)

      if (existingItem) {
        // 如果已存在，增加数量
        toast.success(`${dish.name} 数量 +1`)
        return items.map((item) =>
          item.dishId === dish.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        // 如果不存在，添加新项
        toast.success(`已添加 ${dish.name}`)
        return [
          ...items,
          {
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            quantity: 1,
          },
        ]
      }
    })
  }, [])

  // 从购物车移除
  const removeFromCart = useCallback((dishId: string) => {
    setCartItems((items) => {
      const item = items.find((i) => i.dishId === dishId)
      if (item) {
        toast.success(`已移除 ${item.name}`)
      }
      return items.filter((item) => item.dishId !== dishId)
    })
  }, [])

  // 更新数量
  const updateQuantity = useCallback((dishId: string, delta: number) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (item.dishId === dishId) {
            const newQuantity = Math.max(0, item.quantity + delta)
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }, [])

  // 更新备注
  const updateNotes = useCallback((dishId: string, notes: string) => {
    setCartItems((items) =>
      items.map((item) => (item.dishId === dishId ? { ...item, notes } : item)),
    )
  }, [])

  // 清空购物车
  const clearCart = useCallback(() => {
    setCartItems([])
    setOrderNotes("")
  }, [])

  // 计算金额
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = 0 // 暂时不收税
  const total = subtotal + tax

  const value: POSContextType = {
    selectedTableId,
    setSelectedTableId,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    orderNotes,
    setOrderNotes,
    subtotal,
    tax,
    total,
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export function usePOS() {
  const context = useContext(POSContext)
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider")
  }
  return context
}
