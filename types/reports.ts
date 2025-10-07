/**
 * 报表模块类型定义
 */

/**
 * 报表筛选参数
 */
export interface ReportFilters {
  startDate: string        // 开始日期 ISO 8601 格式
  endDate: string          // 结束日期
  compareStartDate?: string // 对比期开始日期（用于计算增长率）
  compareEndDate?: string   // 对比期结束日期
  reportType?: 'all' | 'revenue' | 'dishes' | 'hourly'
}

/**
 * 核心统计数据
 */
export interface ReportStats {
  totalRevenue: number      // 总营业额
  totalOrders: number       // 订单总数
  avgOrderValue: number     // 客单价
  profitRate: number        // 利润率（百分比）
  comparison?: {
    revenueGrowth: number   // 营业额增长率
    ordersGrowth: number    // 订单增长率
    avgOrderGrowth: number  // 客单价增长率
  }
}

/**
 * 营业额趋势数据点
 */
export interface RevenueDataPoint {
  date: string              // 日期
  revenue: number           // 营业额
  orders: number            // 订单数
  avgOrder: number          // 客单价
}

/**
 * 分类销售数据
 */
export interface CategorySales {
  categoryId: string
  categoryName: string
  totalRevenue: number
  totalOrders: number
  percentage: number        // 占总营业额的百分比
}

/**
 * 热销菜品数据
 */
export interface TopDishData {
  dishId: string
  dishName: string
  categoryName: string
  sales: number             // 销量
  revenue: number           // 营业额
  growth: number            // 增长率
}

/**
 * 时段分析数据
 */
export interface HourlyData {
  timeRange: string         // 时间段，如 "11:00-12:00"
  orders: number            // 订单数
  revenue: number           // 营业额
  avgOrder: number          // 客单价
}

/**
 * 综合报表响应
 */
export interface ReportOverview {
  stats: ReportStats
  revenueChart: RevenueDataPoint[]
  categoryChart: CategorySales[]
  topDishes: TopDishData[]
  hourlyAnalysis: HourlyData[]
}

/**
 * 导出格式
 */
export type ExportFormat = 'excel' | 'pdf'

/**
 * 导出请求
 */
export interface ExportRequest {
  format: ExportFormat
  reportType: 'all' | 'revenue' | 'dishes' | 'hourly'
  filters: ReportFilters
}
