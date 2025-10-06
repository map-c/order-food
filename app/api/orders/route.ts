import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"
import { z } from "zod"

// 创建订单的 Schema
const createOrderSchema = z.object({
  tableId: z.string().min(1, "桌台ID不能为空"),
  items: z
    .array(
      z.object({
        dishId: z.string().min(1, "菜品ID不能为空"),
        quantity: z.number().int().min(1, "数量必须大于0"),
        notes: z.string().optional(),
      }),
    )
    .min(1, "订单至少需要一个菜品"),
  notes: z.string().optional(),
  payMethod: z.enum(["cash", "card", "alipay", "wechat"]).optional(),
})

// 查询订单的 Schema
const queryOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]).optional(),
  tableId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

// GET /api/orders - 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())

    // 验证查询参数
    const validationResult = queryOrderSchema.safeParse(params)
    if (!validationResult.success) {
      return errorResponse("VALIDATION_ERROR", validationResult.error.errors[0].message, 400)
    }

    const { status, tableId, startDate, endDate, page, limit } = validationResult.data

    // 构建查询条件
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (tableId) {
      where.tableId = tableId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // 分页参数
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 50
    const skip = (pageNum - 1) * limitNum

    // 查询订单
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ])

    return successResponse({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error("获取订单列表失败:", error)
    return errorResponse("INTERNAL_ERROR", "获取订单列表失败", 500)
  }
}

// POST /api/orders - 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validationResult = createOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return apiResponse.error(validationResult.error.errors[0].message, 400)
    }

    const { tableId, items, notes, payMethod } = validationResult.data

    // 验证桌台是否存在
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    })

    if (!table) {
      return apiResponse.error("桌台不存在", 404)
    }

    // 获取所有菜品信息并验证
    const dishIds = items.map((item) => item.dishId)
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds },
      },
    })

    if (dishes.length !== dishIds.length) {
      return apiResponse.error("部分菜品不存在", 404)
    }

    // 检查菜品是否可用
    const unavailableDishes = dishes.filter((dish) => !dish.isAvailable || dish.isSoldOut)
    if (unavailableDishes.length > 0) {
      return apiResponse.error(
        `以下菜品不可用: ${unavailableDishes.map((d) => d.name).join(", ")}`,
        400,
      )
    }

    // 计算订单金额
    let totalPrice = 0
    const orderItemsData = items.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId)!
      const subtotal = dish.price * item.quantity
      totalPrice += subtotal

      return {
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice: dish.price,
        subtotal,
        notes: item.notes,
      }
    })

    // 生成订单号（格式：年月日时分秒 + 4位随机数）
    const orderNo = `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNo,
        tableId,
        totalPrice,
        notes,
        payMethod,
        items: {
          create: orderItemsData,
        },
      },
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

    // 更新桌台状态为占用
    await prisma.table.update({
      where: { id: tableId },
      data: { status: "occupied" },
    })

    return apiResponse.success(order, "订单创建成功", 201)
  } catch (error) {
    console.error("创建订单失败:", error)
    return apiResponse.error("创建订单失败", 500)
  }
}
