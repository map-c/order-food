/**
 * 首页看板数据类型定义
 */

export interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  avgOrderValue: number
  tablesTurnover: number
  revenueChange: number
  ordersChange: number
  avgOrderChange: number
  turnoverChange: number
}

export interface SalesDataPoint {
  time: string
  sales: number
}

export interface PopularDish {
  dishId: string
  dishName: string
  sales: number
  revenue: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  tableNumber: string | null
  totalPrice: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  createdAt: string
}

export interface DashboardOverview {
  stats: DashboardStats
  salesChart: SalesDataPoint[]
  popularDishes: PopularDish[]
  recentOrders: RecentOrder[]
}
