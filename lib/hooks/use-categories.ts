import useSWR from "swr"
import { fetcher } from "@/lib/api-client"

interface Category {
  id: string
  name: string
  icon: string | null
  sortOrder: number
  _count?: {
    dishes: number
  }
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>("/api/categories", fetcher)

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
