import { apiResponse } from '@/lib/api-response'

/**
 * 登出接口
 * 注意：由于使用 JWT，token 存储在客户端，服务端不需要做特殊处理
 * 客户端只需删除本地存储的 token 即可
 * 如果需要实现 token 黑名单，可以在此添加逻辑
 */
export async function POST() {
  try {
    // 这里可以添加 token 黑名单逻辑（如果需要）
    // 例如：将 token 加入 Redis 黑名单，直到过期

    return apiResponse.success(null, '登出成功')
  } catch (error) {
    console.error('Logout error:', error)
    return apiResponse.error('登出失败，请稍后重试', 'INTERNAL_ERROR', 500)
  }
}
