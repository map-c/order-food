"use client"

import useSWR from 'swr'
import { fetcher } from '@/lib/api-client'
import type { ReportOverview, ReportFilters } from '@/types/reports'

/**
 * 获取综合报表数据
 */
export function useReportOverview(filters: ReportFilters) {
  const params = new URLSearchParams()
  params.append('startDate', filters.startDate)
  params.append('endDate', filters.endDate)

  if (filters.compareStartDate) {
    params.append('compareStartDate', filters.compareStartDate)
  }
  if (filters.compareEndDate) {
    params.append('compareEndDate', filters.compareEndDate)
  }

  const { data, error, isLoading, mutate } = useSWR<ReportOverview>(
    `/api/reports/overview?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分钟内去重
    }
  )

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * 获取营收报表数据
 */
export function useRevenueReport(
  startDate: string,
  endDate: string,
  granularity: 'hour' | 'day' | 'month' = 'day'
) {
  const params = new URLSearchParams({
    startDate,
    endDate,
    granularity,
  })

  const { data, error, isLoading } = useSWR(
    `/api/reports/revenue?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    data,
    isLoading,
    error,
  }
}

/**
 * 获取菜品销售报表数据
 */
export function useDishesReport(
  startDate: string,
  endDate: string,
  options?: {
    limit?: number
    categoryId?: string
    compareStartDate?: string
    compareEndDate?: string
  }
) {
  const params = new URLSearchParams({
    startDate,
    endDate,
  })

  if (options?.limit) {
    params.append('limit', options.limit.toString())
  }
  if (options?.categoryId) {
    params.append('categoryId', options.categoryId)
  }
  if (options?.compareStartDate) {
    params.append('compareStartDate', options.compareStartDate)
  }
  if (options?.compareEndDate) {
    params.append('compareEndDate', options.compareEndDate)
  }

  const { data, error, isLoading } = useSWR(
    `/api/reports/dishes?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    data,
    isLoading,
    error,
  }
}

/**
 * 获取时段分析报表数据
 */
export function useHourlyReport(startDate: string, endDate: string) {
  const params = new URLSearchParams({
    startDate,
    endDate,
  })

  const { data, error, isLoading } = useSWR(
    `/api/reports/hourly?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    data,
    isLoading,
    error,
  }
}
