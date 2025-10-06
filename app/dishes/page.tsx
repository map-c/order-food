import { TopNav } from "@/components/layout/top-nav"
import { DishFilters } from "@/components/dishes/dish-filters"
import { DishTable } from "@/components/dishes/dish-table"

export default function DishesPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">菜品管理</h1>
              <p className="text-sm text-[#6B7280] mt-1">管理菜品信息、价格和库存</p>
            </div>
          </div>

          {/* Filters */}
          <DishFilters />

          {/* Dish Table */}
          <DishTable />
        </div>
      </main>
    </div>
  )
}
