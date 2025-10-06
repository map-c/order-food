import { TopNav } from "@/components/layout/top-nav"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportStats } from "@/components/reports/report-stats"
import { RevenueChart } from "@/components/reports/revenue-chart"
import { CategoryChart } from "@/components/reports/category-chart"
import { TopDishes } from "@/components/reports/top-dishes"
import { HourlyAnalysis } from "@/components/reports/hourly-analysis"

export default function ReportsPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">报表中心</h1>
              <p className="text-sm text-[#6B7280] mt-1">查看营业数据和经营分析</p>
            </div>
          </div>

          {/* Filters */}
          <ReportFilters />

          {/* Stats Overview */}
          <ReportStats />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <CategoryChart />
            </div>
          </div>

          {/* Analysis Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopDishes />
            <HourlyAnalysis />
          </div>
        </div>
      </main>
    </div>
  )
}
