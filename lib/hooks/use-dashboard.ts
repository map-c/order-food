"use client"

import useSWR from 'swr'
import { fetcher } from '@/lib/api-client'
import type { DashboardOverview } from '@/types/dashboard'

/**
 * 获取首页看板数据
 */
export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardOverview>(
    '/api/dashboard',
    fetcher,
    {
      refreshInterval: 30000, // 每30秒自动刷新
      revalidateOnFocus: true,
    }
  )

  return {
    data: data || null,
    isLoading,
    error,
    mutate,
  }
}
