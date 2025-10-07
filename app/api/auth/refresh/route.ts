import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiResponse } from '@/lib/api-response'
import { verifyToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt'

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token 不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证输入
    const validationResult = refreshSchema.safeParse(body)
    if (!validationResult.success) {
      return apiResponse.error(
        validationResult.error.errors[0].message,
        'VALIDATION_ERROR',
        400
      )
    }

    const { refreshToken } = validationResult.data

    // 验证 refresh token
    const payload = await verifyToken(refreshToken)
    if (!payload) {
      return apiResponse.error('无效的 refresh token', 'INVALID_TOKEN', 401)
    }

    // 生成新的 tokens
    const newAccessToken = await generateAccessToken(payload)
    const newRefreshToken = await generateRefreshToken(payload)

    return apiResponse.success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'Token 刷新成功')
  } catch (error) {
    console.error('Refresh token error:', error)
    return apiResponse.error('Token 刷新失败', 'INTERNAL_ERROR', 500)
  }
}
