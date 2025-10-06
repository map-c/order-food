"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, Plus, Upload, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetcher } from "@/lib/api-client"
import type { Category } from "@/types/api"
import { DishFormDialog } from "./dish-form-dialog"

interface DishFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  onRefresh: () => void
}

export function DishFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  onRefresh,
}: DishFiltersProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  // 获取分类列表
  const { data: categories = [] } = useSWR<Category[]>('/api/categories', fetcher)

  return (
    <>
      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="搜索菜品名称..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="菜品分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="available">在售</SelectItem>
              <SelectItem value="soldout">沽清</SelectItem>
              <SelectItem value="offline">下架</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" className="bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button
              className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加菜品
            </Button>
          </div>
        </div>
      </Card>

      {/* 添加/编辑菜品对话框 */}
      <DishFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        onSuccess={onRefresh}
      />
    </>
  )
}
