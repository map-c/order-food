import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/api-response"
import { z } from "zod"

// 更新订单状态的 Schema
const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]),
})

// PATCH /api/orders/[id]/status - 更新订单状态
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // 验证请求数据
    const validationResult = updateStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return apiResponse.error(validationResult.error.errors[0].message, 400)
    }

    const { status } = validationResult.data

    // 检查订单是否存在
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
      },
    })

    if (!order) {
      return apiResponse.error("订单不存在", 404)
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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

    return apiResponse.success(updatedOrder, "订单状态更新成功")
  } catch (error) {
    console.error("更新订单状态失败:", error)
    return apiResponse.error("更新订单状态失败", 500)
  }
}
