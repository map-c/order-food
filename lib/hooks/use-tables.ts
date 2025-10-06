import useSWR from "swr"
import { fetcher } from "@/lib/api-client"

interface Table {
  id: string
  number: string
  capacity: number
  area: string | null
  status: "available" | "occupied" | "reserved" | "cleaning" | "disabled"
  qrCode: string | null
  note: string | null
}

interface UseTablesOptions {
  status?: string
}

export function useTables(options?: UseTablesOptions) {
  const params = new URLSearchParams()

  if (options?.status) {
    params.append("status", options.status)
  }

  const url = `/api/tables${params.toString() ? `?${params.toString()}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<Table[]>(url, fetcher)

  return {
    tables: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
