import OSS from 'ali-oss'
import type { STSResponse, UploadConfig, UploadResult } from '@/types/oss'

/**
 * 生成唯一文件名
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}-${random}.${ext}`
}

/**
 * 获取 STS 临时凭证
 */
export async function getSTSCredentials(): Promise<STSResponse> {
  try {
    const response = await fetch('/api/oss/sts', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '获取上传凭证失败')
    }

    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取上传凭证失败',
    }
  }
}

/**
 * 创建 OSS 客户端
 */
function createOSSClient(stsResponse: STSResponse): OSS | null {
  if (!stsResponse.success || !stsResponse.credentials || !stsResponse.ossConfig) {
    return null
  }

  const { credentials, ossConfig } = stsResponse

  const ossClientConfig: any = {
    region: ossConfig.region,
    accessKeyId: credentials.accessKeyId,
    accessKeySecret: credentials.accessKeySecret,
    stsToken: credentials.securityToken,
    bucket: ossConfig.bucket,
    timeout: 60000,
  }

  // 智能处理 endpoint，避免 bucket 名称重复
  if (ossConfig.endpoint) {
    const endpoint = ossConfig.endpoint.replace(/\/$/, '')
    // 如果 endpoint 已包含 bucket 名称，去掉 bucket 前缀
    if (endpoint.includes(ossConfig.bucket)) {
      ossClientConfig.endpoint = endpoint.replace(`${ossConfig.bucket}.`, '')
    } else {
      ossClientConfig.endpoint = endpoint
    }
  }

  return new OSS(ossClientConfig)
}

/**
 * 上传文件到 OSS
 */
export async function uploadToOSS(config: UploadConfig): Promise<UploadResult> {
  const { file, pathPrefix = 'dishes/', onProgress } = config

  try {
    // 1. 获取 STS 凭证
    const stsResponse = await getSTSCredentials()
    if (!stsResponse.success) {
      return {
        success: false,
        error: stsResponse.error || '获取上传凭证失败',
      }
    }

    // 2. 创建 OSS 客户端
    const client = createOSSClient(stsResponse)
    if (!client) {
      return {
        success: false,
        error: '创建 OSS 客户端失败',
      }
    }

    // 3. 生成唯一文件名
    const fileName = generateUniqueFileName(file.name)
    const objectKey = `${pathPrefix}${fileName}`

    // 4. 上传文件
    const result = await client.put(objectKey, file, {
      headers: {
        'x-oss-object-acl': 'public-read',
        'Content-Type': file.type,
      },
      ...(onProgress && {
        progress: (p: number) => {
          const percent = Math.floor(p * 100)
          onProgress(percent)
        },
      }),
    } as any)

    // 5. 返回访问 URL（确保使用 HTTPS）
    let url = result.url
    url = url.replace(/^http:/, 'https:')

    return {
      success: true,
      url,
      fileName,
    }
  } catch (error) {
    console.error('上传文件失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    }
  }
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '只支持 JPG、PNG、WebP、GIF 格式的图片',
    }
  }

  const maxSize = 5 * 1024 * 1024  // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片大小不能超过 5MB',
    }
  }

  return { valid: true }
}
