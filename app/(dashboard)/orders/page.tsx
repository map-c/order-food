"use client"

import { useState } from "react"
// import { TopNav } from "@/components/layout/top-nav"
import { OrderFilters, type OrderFilterState } from "@/components/orders/order-filters"
import { OrderList } from "@/components/orders/order-list"

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilterState>({
    search: "",
    status: "all",
    datePreset: "all",
  })

  return (
    <div className="min-h-screen">
      {/* <TopNav /> */}
      <main className="px-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#333333]">订单管理</h1>
            <p className="text-sm text-[#6B7280] mt-1">查看和管理所有订单</p>
          </div>

          {/* Filters */}
          <OrderFilters value={filters} onChange={setFilters} />

          {/* Order List */}
          <OrderList filters={filters} />
        </div>
      </main>
    </div>
  )
}
