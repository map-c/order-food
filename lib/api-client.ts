import type { ApiResponse } from './api-response'

/**
 * API 请求配置
 */
interface FetcherOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * 获取存储的 access token
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * 添加认证头
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken()
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    }
  }
  return {}
}

/**
 * 基础 fetcher 函数（用于 SWR）
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  })

  if (!res.ok) {
    // 401 未授权，跳转到登录页
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
    }

    const error: any = new Error('API请求失败')
    error.status = res.status
    error.info = await res.json()
    throw error
  }

  const data: ApiResponse<T> = await res.json()

  if (!data.success) {
    const error: any = new Error(data.error.message)
    error.code = data.error.code
    throw error
  }

  return data.data
}

/**
 * 通用 API 请求函数
 */
async function request<T>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  // 处理查询参数
  let finalUrl = url
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      finalUrl = `${url}?${queryString}`
    }
  }

  const res = await fetch(finalUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  })

  // 401 未授权，跳转到登录页
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login'
  }

  const data: ApiResponse<T> = await res.json()

  if (!data.success) {
    const error: any = new Error(data.error.message)
    error.code = data.error.code
    error.status = res.status
    throw error
  }

  return data.data
}

/**
 * API 客户端
 */
export const apiClient = {
  get: <T>(url: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(url, { method: 'GET', params }),

  post: <T>(url: string, body: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(url: string, body: unknown) =>
    request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
}
