import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import { verifyPassword } from '@/lib/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import type { LoginResponse } from '@/types/auth'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证输入
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return apiResponse.error(
        validationResult.error.errors[0].message,
        'VALIDATION_ERROR',
        400
      )
    }

    const { email, password } = validationResult.data

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return apiResponse.error('邮箱或密码错误', 'INVALID_CREDENTIALS', 401)
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return apiResponse.error('邮箱或密码错误', 'INVALID_CREDENTIALS', 401)
    }

    // 生成 tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user

    const response: LoginResponse = {
      user: {
        ...userWithoutPassword,
        role: userWithoutPassword.role as 'owner' | 'manager' | 'staff',
      },
      accessToken,
      refreshToken,
    }

    return apiResponse.success(response, '登录成功')
  } catch (error) {
    console.error('Login error:', error)
    return apiResponse.error('登录失败，请稍后重试', 'INTERNAL_ERROR', 500)
  }
}
