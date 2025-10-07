import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'

/**
 * 将时间字符串转换为秒数
 */
function parseExpiration(exp: string): number {
  const unit = exp.slice(-1)
  const value = parseInt(exp.slice(0, -1))

  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 24 * 60 * 60
    default: return 7 * 24 * 60 * 60 // 默认 7 天
  }
}

/**
 * 生成 Access Token
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const expiresIn = parseExpiration(JWT_EXPIRES_IN)

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret)

  return token
}

/**
 * 生成 Refresh Token
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const expiresIn = parseExpiration(REFRESH_TOKEN_EXPIRES_IN)

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret)

  return token
}

/**
 * 验证 Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * 从请求头中提取 Token
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
