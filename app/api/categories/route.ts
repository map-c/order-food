import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, CommonErrors } from '@/lib/api-response'

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: 获取分类列表
 *     description: 获取所有菜品分类，按排序顺序返回
 *     tags:
 *       - 分类
 *     responses:
 *       200:
 *         description: 成功返回分类列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Category'
 *                       - type: object
 *                         properties:
 *                           _count:
 *                             type: object
 *                             properties:
 *                               dishes:
 *                                 type: number
 *                                 description: 该分类下的菜品数量
 *                                 example: 5
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
