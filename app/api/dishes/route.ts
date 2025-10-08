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
 * @swagger
 * /api/dishes:
 *   get:
 *     summary: 获取菜品列表
 *     description: 获取所有菜品列表，支持分类、搜索、可用性筛选
 *     tags:
 *       - 菜品
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 按分类ID筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（匹配菜品名称或描述）
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 筛选上架/下架状态
 *       - in: query
 *         name: isSoldOut
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 筛选沽清状态
 *     responses:
 *       200:
 *         description: 成功返回菜品列表
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
 *                     $ref: '#/components/schemas/Dish'
 *       422:
 *         description: 参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @swagger
 * /api/dishes:
 *   post:
 *     summary: 创建新菜品
 *     description: 创建一个新的菜品
 *     tags:
 *       - 菜品
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *               - price
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: 菜品名称
 *                 example: 宫保鸡丁
 *               categoryId:
 *                 type: string
 *                 description: 所属分类ID
 *                 example: clxyz123456
 *               price:
 *                 type: number
 *                 description: 价格
 *                 example: 38.0
 *               image:
 *                 type: string
 *                 format: uri
 *                 description: 菜品图片URL
 *                 example: https://example.com/dish.jpg
 *               description:
 *                 type: string
 *                 description: 菜品描述
 *                 example: 经典川菜，麻辣鲜香
 *               isAvailable:
 *                 type: boolean
 *                 description: 是否上架
 *                 default: true
 *               isSoldOut:
 *                 type: boolean
 *                 description: 是否沽清
 *                 default: false
 *               stock:
 *                 type: number
 *                 description: 库存数量
 *                 example: 50
 *     responses:
 *       201:
 *         description: 菜品创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *                 message:
 *                   type: string
 *                   example: 菜品创建成功
 *       404:
 *         description: 分类不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
