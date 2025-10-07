"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { getDateRange } from '@/lib/date-utils'
import type { ReportFilters } from '@/types/reports'

export type DateRangeType = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year'

interface ReportContextType {
  filters: ReportFilters
  dateRange: DateRangeType
  setDateRange: (range: DateRangeType) => void
  setCustomDateRange: (startDate: string, endDate: string) => void
  enableComparison: boolean
  setEnableComparison: (enabled: boolean) => void
}

const ReportContext = createContext<ReportContextType | undefined>(undefined)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRangeState] = useState<DateRangeType>('today')
  const [enableComparison, setEnableComparison] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const range = getDateRange('today')
    return {
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
    }
  })

  const setDateRange = (range: DateRangeType) => {
    setDateRangeState(range)
    const dateRange = getDateRange(range)

    const newFilters: ReportFilters = {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
    }

    // 如果启用了对比，自动设置对比期
    if (enableComparison) {
      const compareRange = getComparisonRange(range)
      newFilters.compareStartDate = compareRange.start.toISOString()
      newFilters.compareEndDate = compareRange.end.toISOString()
    }

    setFilters(newFilters)
  }

  const setCustomDateRange = (startDate: string, endDate: string) => {
    setFilters({
      startDate,
      endDate,
      ...(enableComparison && {
        compareStartDate: filters.compareStartDate,
        compareEndDate: filters.compareEndDate,
      }),
    })
  }

  return (
    <ReportContext.Provider
      value={{
        filters,
        dateRange,
        setDateRange,
        setCustomDateRange,
        enableComparison,
        setEnableComparison,
      }}
    >
      {children}
    </ReportContext.Provider>
  )
}

export function useReportContext() {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReportContext must be used within ReportProvider')
  }
  return context
}

// 获取对比期范围（环比）
function getComparisonRange(range: DateRangeType): { start: Date; end: Date } {
  const current = getDateRange(range)
  const diffMs = current.end.getTime() - current.start.getTime()

  return {
    start: new Date(current.start.getTime() - diffMs),
    end: new Date(current.start.getTime() - 1),
  }
}
