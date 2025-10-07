import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/api-response'
import { authenticateRequest } from '@/lib/auth-middleware'

/**
 * 获取当前登录用户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 验证 token
    const authUser = await authenticateRequest(request)
    if (!authUser) {
      return apiResponse.error('未授权，请先登录', 'UNAUTHORIZED', 401)
    }

    // 查询用户详细信息
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return apiResponse.error('用户不存在', 'USER_NOT_FOUND', 404)
    }

    return apiResponse.success(user)
  } catch (error) {
    console.error('Get current user error:', error)
    return apiResponse.error('获取用户信息失败', 'INTERNAL_ERROR', 500)
  }
}
