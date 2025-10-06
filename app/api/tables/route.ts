import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, CommonErrors } from '@/lib/api-response'

// 创建桌台的验证 Schema
const createTableSchema = z.object({
  number: z.string().min(1, '桌号不能为空'),
  capacity: z.number().int().positive('容纳人数必须为正整数'),
  area: z.string().optional(),
  note: z.string().optional(),
})

/**
 * GET /api/tables
 * 获取桌台列表，支持筛选
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const area = searchParams.get('area')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (area) {
      where.area = area
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy: [
        { number: 'asc' },
      ],
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

    // 转换数据格式，添加 hasOrders 字段
    const tablesWithOrders = tables.map((table) => {
      const { _count, ...tableData } = table
      return {
        ...tableData,
        hasOrders: _count.orders > 0,
      }
    })

    return successResponse(tablesWithOrders)
  } catch (error) {
    console.error('获取桌台列表失败:', error)
    return CommonErrors.internalError('获取桌台列表失败')
  }
}

/**
 * POST /api/tables
 * 创建新桌台
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证输入
    const validationResult = createTableSchema.safeParse(body)
    if (!validationResult.success) {
      return CommonErrors.validationError(validationResult.error.errors[0].message)
    }

    const { number, capacity, area, note } = validationResult.data

    // 检查桌号是否已存在
    const existingTable = await prisma.table.findUnique({
      where: { number },
    })

    if (existingTable) {
      return CommonErrors.validationError(`桌号 ${number} 已存在`)
    }

    // 创建桌台（自动生成二维码链接）
    const createData: {
      number: string
      capacity: number
      area?: string
      note?: string
      qrCode: string
      status: string
    } = {
      number,
      capacity,
      qrCode: `https://your-domain.com/order?table=${number}`,
      status: 'available',
    }

    if (area) {
      createData.area = area
    }

    if (note) {
      createData.note = note
    }

    const table = await prisma.table.create({
      data: createData,
    })

    return successResponse(table, '桌台创建成功', 201)
  } catch (error) {
    console.error('创建桌台失败:', error)
    return CommonErrors.internalError('创建桌台失败')
  }
}
