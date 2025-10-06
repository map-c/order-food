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
