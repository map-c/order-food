import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"
import { z } from "zod"

const statusEnum = z.enum(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"])
const payMethodEnum = z.enum(["cash", "card", "alipay", "wechat"])

// 更新订单状态的 Schema
const updateStatusSchema = z.object({
  status: statusEnum,
  payMethod: payMethodEnum.optional(),
  paidAmount: z.number().min(0, "实付金额不能小于 0").optional(),
  isPaid: z.boolean().optional(),
})

// PATCH /api/orders/[id]/status - 更新订单状态
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // 验证请求数据
    const validationResult = updateStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse("VALIDATION_ERROR", validationResult.error.errors[0].message, 400)
    }

    const { status, payMethod, paidAmount, isPaid } = validationResult.data

    // 检查订单是否存在
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
      },
    })

    if (!order) {
      return errorResponse("NOT_FOUND", "订单不存在", 404)
    }

    const updateData: Prisma.OrderUpdateInput = { status }

    if (payMethod !== undefined) {
      updateData.payMethod = payMethod
    }

    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount
    }

    if (typeof isPaid === "boolean") {
      updateData.isPaid = isPaid
    } else if (status === "completed") {
      if (paidAmount !== undefined) {
        updateData.isPaid = paidAmount >= order.totalPrice ? true : order.isPaid
      } else {
        updateData.isPaid = true
      }
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
        items: {
          include: {
            dish: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    // 如果订单完成或取消，更新桌台状态为空闲
    if (status === "completed" || status === "cancelled") {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "available" },
      })
    }

    return successResponse(updatedOrder, "订单状态更新成功")
  } catch (error) {
    console.error("更新订单状态失败:", error)
    return errorResponse("INTERNAL_ERROR", "更新订单状态失败", 500)
  }
}
