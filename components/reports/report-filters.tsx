"use client"

import { useState } from "react"
import { Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReportFilters() {
  const [dateRange, setDateRange] = useState("today")
  const [reportType, setReportType] = useState("all")

  return (
    <Card className="p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range */}
        <Select value={dateRange} onValueChange={setDateRange}>
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
            <SelectItem value="custom">自定义</SelectItem>
          </SelectContent>
        </Select>

        {/* Report Type */}
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="报表类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">综合报表</SelectItem>
            <SelectItem value="revenue">营业额报表</SelectItem>
            <SelectItem value="dishes">菜品销售报表</SelectItem>
            <SelectItem value="hourly">时段分析报表</SelectItem>
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
