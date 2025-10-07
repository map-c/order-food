"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReportContext } from "@/lib/report-context"
import { useReportOverview } from "@/lib/hooks/use-reports"

export function TopDishes() {
  const { filters } = useReportContext()
  const { data, isLoading } = useReportOverview(filters)

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  const topDishes = data?.topDishes || []

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#333333]">热销菜品 TOP 5</h3>
        <p className="text-sm text-[#6B7280] mt-1">销量最高的菜品排行</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">排名</TableHead>
            <TableHead>菜品名称</TableHead>
            <TableHead className="text-right">销量</TableHead>
            <TableHead className="text-right">营业额</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topDishes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[#6B7280] py-8">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            topDishes.map((dish, index) => (
              <TableRow key={dish.dishId}>
                <TableCell>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                      index === 0
                        ? "bg-[#1E90FF] text-white"
                        : index === 1
                          ? "bg-[#28C76F] text-white"
                          : index === 2
                            ? "bg-[#FFB400] text-white"
                            : "bg-[#F0F2F5] text-[#6B7280]"
                    }`}
                  >
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{dish.dishName}</TableCell>
                <TableCell className="text-right text-[#6B7280]">{dish.sales} 份</TableCell>
                <TableCell className="text-right font-semibold text-[#1E90FF]">
                  ¥{dish.revenue.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
