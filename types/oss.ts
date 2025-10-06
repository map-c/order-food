/**
 * 阿里云 OSS STS 相关类型定义
 */

/**
 * STS 临时凭证
 */
export interface STSCredentials {
  /** 临时访问密钥 ID */
  accessKeyId: string
  /** 临时访问密钥 Secret */
  accessKeySecret: string
  /** 安全令牌 */
  securityToken: string
  /** 凭证过期时间 */
  expiration: string
}

/**
 * STS API 响应
 */
export interface STSResponse {
  /** 是否成功 */
  success: boolean
  /** STS 凭证 */
  credentials?: STSCredentials
  /** OSS 配置信息 */
  ossConfig?: {
    /** OSS 区域 */
    region: string
    /** Bucket 名称 */
    bucket: string
    /** 自定义域名（可选） */
    endpoint?: string
  }
  /** 错误信息 */
  error?: string
}

/**
 * 文件上传配置
 */
export interface UploadConfig {
  /** 文件对象 */
  file: File
  /** 存储路径前缀 */
  pathPrefix?: string
  /** 上传进度回调 */
  onProgress?: (percent: number) => void
}

/**
 * 文件上传结果
 */
export interface UploadResult {
  /** 是否成功 */
  success: boolean
  /** 文件访问 URL */
  url?: string
  /** 文件名 */
  fileName?: string
  /** 错误信息 */
  error?: string
}
