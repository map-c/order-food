import { TopNav } from "@/components/layout/top-nav"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { PopularDishes } from "@/components/dashboard/popular-dishes"
import { SalesChart } from "@/components/dashboard/sales-chart"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#333333]">首页看板</h1>
            <p className="text-sm text-[#6B7280] mt-1">实时查看餐厅运营数据</p>
          </div>

          {/* Stats Cards */}
          <DashboardStats />

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart />
            </div>
            <div>
              <PopularDishes />
            </div>
          </div>

          {/* Recent Orders */}
          <RecentOrders />
        </div>
      </main>
    </div>
  )
}
