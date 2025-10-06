import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, CommonErrors } from '@/lib/api-response'

// 更新桌台的验证 Schema
const updateTableSchema = z.object({
  number: z.string().min(1, '桌号不能为空').optional(),
  capacity: z.number().int().positive('容纳人数必须为正整数').optional(),
  area: z.string().optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning', 'disabled']).optional(),
  note: z.string().optional(),
})

/**
 * GET /api/tables/[id]
 * 获取单个桌台详情
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              in: ['pending', 'confirmed', 'preparing', 'ready'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    })

    if (!table) {
      return CommonErrors.notFound('桌台')
    }

    return successResponse(table)
  } catch (error) {
    console.error('获取桌台详情失败:', error)
    return CommonErrors.internalError('获取桌台详情失败')
  }
}

/**
 * PATCH /api/tables/[id]
 * 更新桌台信息
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // 验证输入
    const validationResult = updateTableSchema.safeParse(body)
    if (!validationResult.success) {
      return CommonErrors.validationError(validationResult.error.errors[0].message)
    }

    // 检查桌台是否存在
    const existingTable = await prisma.table.findUnique({
      where: { id },
    })

    if (!existingTable) {
      return CommonErrors.notFound('桌台')
    }

    const updateData = validationResult.data

    // 如果修改桌号，检查新桌号是否已存在
    if (updateData.number && updateData.number !== existingTable.number) {
      const duplicateTable = await prisma.table.findUnique({
        where: { number: updateData.number },
      })

      if (duplicateTable) {
        return CommonErrors.validationError(`桌号 ${updateData.number} 已存在`)
      }
    }

    // 更新桌台
    const updatedTable = await prisma.table.update({
      where: { id },
      data: updateData,
    })

    return successResponse(updatedTable, '桌台更新成功')
  } catch (error) {
    console.error('更新桌台失败:', error)
    return CommonErrors.internalError('更新桌台失败')
  }
}

/**
 * DELETE /api/tables/[id]
 * 删除桌台
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 检查桌台是否存在
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: ['pending', 'confirmed', 'preparing', 'ready'],
                },
              },
            },
          },
        },
      },
    })

    if (!table) {
      return CommonErrors.notFound('桌台')
    }

    // 检查是否有未完成的订单
    if (table._count.orders > 0) {
      return CommonErrors.validationError('该桌台有未完成的订单，无法删除')
    }

    // 删除桌台
    await prisma.table.delete({
      where: { id },
    })

    return successResponse(null, '桌台删除成功')
  } catch (error) {
    console.error('删除桌台失败:', error)
    return CommonErrors.internalError('删除桌台失败')
  }
}
