import useSWR from "swr"
import { fetcher } from "@/lib/api-client"

interface Dish {
  id: string
  name: string
  categoryId: string
  price: number
  image: string
  description: string | null
  isAvailable: boolean
  isSoldOut: boolean
  stock: number | null
  category: {
    id: string
    name: string
  }
}

interface UseDishesOptions {
  categoryId?: string
  search?: string
  available?: boolean
}

export function useDishes(options?: UseDishesOptions) {
  const params = new URLSearchParams()

  if (options?.categoryId) {
    params.append("categoryId", options.categoryId)
  }

  if (options?.search) {
    params.append("search", options.search)
  }

  if (options?.available !== undefined) {
    params.append("available", options.available.toString())
  }

  const url = `/api/dishes${params.toString() ? `?${params.toString()}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<Dish[]>(url, fetcher)

  return {
    dishes: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
