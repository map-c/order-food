"use client"

import { Search, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type OrderDatePreset = "today" | "yesterday" | "week" | "month" | "all"

export interface OrderFilterState {
  search: string
  status: string
  datePreset: OrderDatePreset
}

interface OrderFiltersProps {
  value: OrderFilterState
  onChange: (value: OrderFilterState) => void
  onExport?: () => void
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待支付" },
  { value: "confirmed", label: "已确认" },
  { value: "preparing", label: "制作中" },
  { value: "ready", label: "待取餐" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
]

const DATE_OPTIONS: Array<{ value: OrderDatePreset; label: string }> = [
  { value: "today", label: "今天" },
  { value: "yesterday", label: "昨天" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
  { value: "all", label: "全部" },
]

export function OrderFilters({ value, onChange, onExport }: OrderFiltersProps) {
  const handleSearchChange = (search: string) => {
    onChange({ ...value, search })
  }

  const handleStatusChange = (status: string) => {
    onChange({ ...value, status })
  }

  const handleDateChange = (datePreset: OrderDatePreset) => {
    onChange({ ...value, datePreset })
  }

  return (
    <Card className="p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <Input
              placeholder="搜索订单号、桌号..."
              value={value.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select value={value.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="订单状态" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Select value={value.datePreset} onValueChange={handleDateChange}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="日期筛选" />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Export Button */}
        <Button
          variant="outline"
          className="ml-auto bg-transparent"
          onClick={onExport}
        >
          导出数据
        </Button>
      </div>
    </Card>
  )
}
