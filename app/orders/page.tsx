import { TopNav } from "@/components/layout/top-nav"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderList } from "@/components/orders/order-list"

export default function OrdersPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#333333]">订单管理</h1>
            <p className="text-sm text-[#6B7280] mt-1">查看和管理所有订单</p>
          </div>

          {/* Filters */}
          <OrderFilters />

          {/* Order List */}
          <OrderList />
        </div>
      </main>
    </div>
  )
}
