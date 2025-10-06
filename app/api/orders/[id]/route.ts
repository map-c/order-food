import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/api-response"

// GET /api/orders/[id] - 获取单个订单详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return apiResponse.error("订单不存在", 404)
    }

    return apiResponse.success(order)
  } catch (error) {
    console.error("获取订单详情失败:", error)
    return apiResponse.error("获取订单详情失败", 500)
  }
}

// DELETE /api/orders/[id] - 删除订单（取消订单）
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return apiResponse.error("订单不存在", 404)
    }

    // 只允许取消待处理的订单
    if (order.status !== "pending") {
      return apiResponse.error("只能取消待处理的订单", 400)
    }

    // 更新订单状态为已取消
    await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    })

    return apiResponse.success(null, "订单已取消")
  } catch (error) {
    console.error("取消订单失败:", error)
    return apiResponse.error("取消订单失败", 500)
  }
}
