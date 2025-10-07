import { NextRequest } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './jwt'
import type { JWTPayload } from '@/types/auth'

/**
 * 从请求中验证并提取用户信息
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

/**
 * 验证用户是否有权限访问（可扩展为基于角色的权限控制）
 */
export function authorizeUser(
  user: JWTPayload | null,
  allowedRoles?: string[]
): boolean {
  if (!user) {
    return false
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.includes(user.role)
}
