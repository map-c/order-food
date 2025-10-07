"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReportContext } from "@/lib/report-context"
import { useReportOverview } from "@/lib/hooks/use-reports"

export function HourlyAnalysis() {
  const { filters } = useReportContext()
  const { data, isLoading } = useReportOverview(filters)

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  const hourlyData = (data?.hourlyAnalysis || []).filter((item) => item.orders > 0)

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">时段分析</h3>
        <p className="text-sm text-[#6B7280] mt-1">各时段营业数据统计</p>
      </div>
      <div className="max-h-[400px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间段</TableHead>
              <TableHead className="text-right">订单数</TableHead>
              <TableHead className="text-right">营业额</TableHead>
              <TableHead className="text-right">客单价</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hourlyData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[#6B7280] py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              hourlyData.map((item) => (
                <TableRow key={item.timeRange}>
                  <TableCell className="font-medium">{item.timeRange}</TableCell>
                  <TableCell className="text-right text-[#6B7280]">{item.orders}</TableCell>
                  <TableCell className="text-right font-semibold text-[#1E90FF]">
                    ¥{item.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-[#6B7280]">¥{item.avgOrder.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
