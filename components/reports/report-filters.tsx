"use client"

import { Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReportContext, type DateRangeType } from "@/lib/report-context"

export function ReportFilters() {
  const { dateRange, setDateRange } = useReportContext()

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as DateRangeType)
  }

  return (
    <Card className="p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range */}
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="选择时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">今天</SelectItem>
            <SelectItem value="yesterday">昨天</SelectItem>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
            <SelectItem value="quarter">本季度</SelectItem>
            <SelectItem value="year">本年</SelectItem>
          </SelectContent>
        </Select>

        {/* Export Buttons */}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            导出 Excel
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            导出 PDF
          </Button>
        </div>
      </div>
    </Card>
  )
}
