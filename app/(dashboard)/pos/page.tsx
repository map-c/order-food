"use client"

// import { TopNav } from "@/components/layout/top-nav"
import { TableSelector } from "@/components/pos/table-selector"
import { DishGrid } from "@/components/pos/dish-grid"
import { OrderCart } from "@/components/pos/order-cart"
import { POSProvider } from "@/lib/contexts/pos-context"

export default function POSPage() {
  return (
    <POSProvider>
      <div className="min-h-screen">
        <main className="h-[calc(100vh-3.5rem)] flex">
          {/* Left: Table Selector */}
          <div className="w-60 border-r bg-white">
            <TableSelector />
          </div>

          {/* Center: Dish Grid */}
          <div className="flex-1 overflow-auto">
            <DishGrid />
          </div>

          {/* Right: Order Cart */}
          <div className="w-80 border-l bg-white">
            <OrderCart />
          </div>
        </main>
      </div>
    </POSProvider>
  )
}
