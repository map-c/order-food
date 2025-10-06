import { NextRequest, NextResponse } from 'next/server'
import OSS from 'ali-oss'
import type { STSResponse } from '@/types/oss'

// STS 凭证有效期（秒）
const STS_DURATION_SECONDS = 3600

export async function GET(request: NextRequest) {
  try {
    const {
      ALIYUN_OSS_ACCESS_KEY_ID,
      ALIYUN_OSS_ACCESS_KEY_SECRET,
      ALIYUN_OSS_RAM_ROLE_ARN,
      ALIYUN_OSS_REGION,
      ALIYUN_OSS_BUCKET,
      ALIYUN_OSS_ENDPOINT,
    } = process.env

    // 验证必需的环境变量
    if (!ALIYUN_OSS_ACCESS_KEY_ID || !ALIYUN_OSS_ACCESS_KEY_SECRET ||
        !ALIYUN_OSS_RAM_ROLE_ARN || !ALIYUN_OSS_REGION || !ALIYUN_OSS_BUCKET) {
      return NextResponse.json({
        success: false,
        error: 'OSS 配置不完整',
      } as STSResponse, { status: 500 })
    }

    // 使用 ali-oss 的 STS 客户端
    const { STS } = OSS
    const sts = new STS({
      accessKeyId: ALIYUN_OSS_ACCESS_KEY_ID,
      accessKeySecret: ALIYUN_OSS_ACCESS_KEY_SECRET,
    })

    // 生成会话名称
    const roleSessionName = `oss-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 调用 AssumeRole 获取临时凭证
    const assumeRoleResponse = await sts.assumeRole(
      ALIYUN_OSS_RAM_ROLE_ARN,
      '',  // policy 传空字符串使用角色全部权限
      STS_DURATION_SECONDS,
      roleSessionName
    )

    const credentials = assumeRoleResponse.credentials

    if (!credentials) {
      throw new Error('获取 STS 凭证失败')
    }

    // 返回凭证和 OSS 配置
    const response: STSResponse = {
      success: true,
      credentials: {
        accessKeyId: credentials.AccessKeyId,
        accessKeySecret: credentials.AccessKeySecret,
        securityToken: credentials.SecurityToken,
        expiration: credentials.Expiration,
      },
      ossConfig: {
        region: ALIYUN_OSS_REGION,
        bucket: ALIYUN_OSS_BUCKET,
        endpoint: ALIYUN_OSS_ENDPOINT,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('获取 STS 凭证失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取上传凭证失败',
    } as STSResponse, { status: 500 })
  }
}
