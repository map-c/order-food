import useSWR from "swr"
import { fetcher } from "@/lib/api-client"

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes: string | null
  dish: {
    id: string
    name: string
    image: string
    category: {
      id: string
      name: string
    }
  }
}

interface Order {
  id: string
  orderNo: string
  tableId: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  totalPrice: number
  paidAmount: number
  isPaid: boolean
  payMethod: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  table: {
    id: string
    number: string
    area: string | null
  }
  items: OrderItem[]
}

interface UseOrdersOptions {
  status?: string
  tableId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export function useOrders(options?: UseOrdersOptions) {
  const params = new URLSearchParams()

  if (options?.status) {
    params.append("status", options.status)
  }

  if (options?.tableId) {
    params.append("tableId", options.tableId)
  }

  if (options?.startDate) {
    params.append("startDate", options.startDate)
  }

  if (options?.endDate) {
    params.append("endDate", options.endDate)
  }

  if (options?.page) {
    params.append("page", options.page.toString())
  }

  if (options?.limit) {
    params.append("limit", options.limit.toString())
  }

  const url = `/api/orders${params.toString() ? `?${params.toString()}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<{
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>(url, fetcher)

  return {
    orders: data?.orders || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  }
}
