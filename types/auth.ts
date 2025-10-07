/**
 * 认证相关类型定义
 */

export interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'manager' | 'staff'
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}
