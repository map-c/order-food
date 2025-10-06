import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, CommonErrors } from '@/lib/api-response'

/**
 * GET /api/categories
 * 获取所有菜品分类
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        _count: {
          select: {
            dishes: true,
          },
        },
      },
    })

    return successResponse(categories)
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return CommonErrors.internalError('获取分类列表失败')
  }
}
