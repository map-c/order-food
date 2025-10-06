"use client"

import { useState } from "react"
import { TopNav } from "@/components/layout/top-nav"
import { DishFilters } from "@/components/dishes/dish-filters"
import { DishTable } from "@/components/dishes/dish-table"

export default function DishesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

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
          <DishFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onRefresh={handleRefresh}
          />

          {/* Dish Table */}
          <DishTable
            key={refreshKey}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
          />
        </div>
      </main>
    </div>
  )
}
