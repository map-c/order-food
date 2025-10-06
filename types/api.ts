/**
 * API 类型定义
 */

// 菜品类型
export interface Dish {
  id: string
  name: string
  categoryId: string
  price: number
  image: string
  description: string | null
  isAvailable: boolean
  isSoldOut: boolean
  stock: number | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    icon: string | null
  }
}

// 分类类型
export interface Category {
  id: string
  name: string
  icon: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count?: {
    dishes: number
  }
}

// 创建菜品请求
export interface CreateDishRequest {
  name: string
  categoryId: string
  price: number
  image: string
  description?: string
  isAvailable?: boolean
  isSoldOut?: boolean
  stock?: number
}

// 更新菜品请求
export interface UpdateDishRequest {
  name?: string
  categoryId?: string
  price?: number
  image?: string
  description?: string
  isAvailable?: boolean
  isSoldOut?: boolean
  stock?: number | null
}

// 菜品查询参数
export interface DishQueryParams {
  categoryId?: string
  search?: string
  isAvailable?: boolean
  isSoldOut?: boolean
}

// 订单相关类型
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"

export type OrderPayMethod = "cash" | "card" | "alipay" | "wechat"

export interface TableSummary {
  id: string
  number: string
  capacity: number
  area: string | null
  status: string
  qrCode: string | null
  note: string | null
}

export interface OrderItem {
  id: string
  orderId: string
  dishId: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes: string | null
  createdAt: string
  updatedAt: string
  dish: Dish
}

export interface Order {
  id: string
  orderNo: string
  tableId: string
  status: OrderStatus
  totalPrice: number
  paidAmount: number
  isPaid: boolean
  payMethod: OrderPayMethod | null
  notes: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
  table: TableSummary
  items: OrderItem[]
  createdBy?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export interface OrderListResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
