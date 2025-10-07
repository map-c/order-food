'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 从 localStorage 获取 token
  const getAccessToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }, [])

  const getRefreshToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }, [])

  // 保存 token 和用户信息
  const saveAuth = useCallback((accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  // 清除认证信息
  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error.message)
      }

      const { accessToken, refreshToken, user: userData } = data.data
      saveAuth(accessToken, refreshToken, userData)
      router.push('/')
    } catch (error) {
      clearAuth()
      throw error
    }
  }, [router, saveAuth, clearAuth])

  // 登出
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      router.push('/login')
    }
  }, [router, clearAuth])

  // 刷新 token
  const refreshToken = useCallback(async () => {
    try {
      const currentRefreshToken = getRefreshToken()
      if (!currentRefreshToken) {
        throw new Error('No refresh token')
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error.message)
      }

      const { accessToken, refreshToken: newRefreshToken } = data.data

      if (user) {
        saveAuth(accessToken, newRefreshToken, user)
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      clearAuth()
      router.push('/login')
    }
  }, [getRefreshToken, user, router, saveAuth, clearAuth])

  // 初始化时从 localStorage 恢复用户信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken()
        const storedUser = localStorage.getItem(USER_KEY)

        if (token && storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)

          // 验证 token 是否仍然有效
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            // Token 无效，尝试刷新
            await refreshToken()
          }
        }
      } catch (error) {
        console.error('Init auth error:', error)
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 导出 token 获取函数供 API client 使用
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}
