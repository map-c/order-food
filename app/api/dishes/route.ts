import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, CommonErrors } from '@/lib/api-response'

// 查询参数验证
const dishQuerySchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  isAvailable: z.enum(['true', 'false']).optional(),
  isSoldOut: z.enum(['true', 'false']).optional(),
})

// 创建菜品验证
const createDishSchema = z.object({
  name: z.string().min(1, '菜品名称不能为空'),
  categoryId: z.string().min(1, '请选择分类'),
  price: z.number().positive('价格必须大于0'),
  image: z.string().url('请提供有效的图片URL'),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  stock: z.number().int().nonnegative().optional(),
})

/**
 * GET /api/dishes
 * 获取菜品列表（支持分类、搜索、可用性筛选）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)

    // 验证查询参数
    const validationResult = dishQuerySchema.safeParse(params)
    if (!validationResult.success) {
      return CommonErrors.validationError(validationResult.error.errors[0].message)
    }

    const { categoryId, search, isAvailable, isSoldOut } = validationResult.data

    // 构建查询条件
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true'
    }

    if (isSoldOut !== undefined) {
      where.isSoldOut = isSoldOut === 'true'
    }

    // 查询菜品
    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { createdAt: 'desc' },
      ],
    })

    return successResponse(dishes)
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    return CommonErrors.internalError('获取菜品列表失败')
  }
}

/**
 * POST /api/dishes
 * 创建新菜品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validationResult = createDishSchema.safeParse(body)
    if (!validationResult.success) {
      return CommonErrors.validationError(validationResult.error.errors[0].message)
    }

    const data = validationResult.data

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return CommonErrors.notFound('菜品分类')
    }

    // 创建菜品
    const dish = await prisma.dish.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    return successResponse(dish, '菜品创建成功', 201)
  } catch (error) {
    console.error('创建菜品失败:', error)
    return CommonErrors.internalError('创建菜品失败')
  }
}
