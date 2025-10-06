import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { successResponse, CommonErrors } from '@/lib/api-response'

// 更新菜品验证（所有字段可选）
const updateDishSchema = z.object({
  name: z.string().min(1, '菜品名称不能为空').optional(),
  categoryId: z.string().min(1, '请选择分类').optional(),
  price: z.number().positive('价格必须大于0').optional(),
  image: z.string().url('请提供有效的图片URL').optional(),
  description: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isSoldOut: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional().nullable(),
})

/**
 * GET /api/dishes/[id]
 * 获取单个菜品详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const dish = await prisma.dish.findUnique({
      where: { id },
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

    if (!dish) {
      return CommonErrors.notFound('菜品')
    }

    return successResponse(dish)
  } catch (error) {
    console.error('获取菜品详情失败:', error)
    return CommonErrors.internalError('获取菜品详情失败')
  }
}

/**
 * PATCH /api/dishes/[id]
 * 更新菜品信息
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // 验证请求数据
    const validationResult = updateDishSchema.safeParse(body)
    if (!validationResult.success) {
      return CommonErrors.validationError(validationResult.error.errors[0].message)
    }

    const data = validationResult.data

    // 检查菜品是否存在
    const existingDish = await prisma.dish.findUnique({
      where: { id },
    })

    if (!existingDish) {
      return CommonErrors.notFound('菜品')
    }

    // 如果要更新分类，验证分类是否存在
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      })

      if (!category) {
        return CommonErrors.notFound('菜品分类')
      }
    }

    // 更新菜品
    const updatedDish = await prisma.dish.update({
      where: { id },
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

    return successResponse(updatedDish, '菜品更新成功')
  } catch (error) {
    console.error('更新菜品失败:', error)
    return CommonErrors.internalError('更新菜品失败')
  }
}

/**
 * DELETE /api/dishes/[id]
 * 删除菜品
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查菜品是否存在
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        orderItems: {
          take: 1,
        },
      },
    })

    if (!dish) {
      return CommonErrors.notFound('菜品')
    }

    // 检查是否有关联的订单项
    if (dish.orderItems.length > 0) {
      return CommonErrors.badRequest('该菜品已有订单记录，无法删除')
    }

    // 删除菜品
    await prisma.dish.delete({
      where: { id },
    })

    return successResponse({ id }, '菜品删除成功')
  } catch (error) {
    console.error('删除菜品失败:', error)
    return CommonErrors.internalError('删除菜品失败')
  }
}
