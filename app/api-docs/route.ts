import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  spec: {
    url: '/api/openapi',
  },
  theme: 'purple',
  layout: 'modern',
  defaultHttpClient: {
    targetKey: 'js',
    clientKey: 'fetch',
  },
  metaData: {
    title: '餐馆点餐系统 API 文档',
    description: '单店版餐馆管理系统的 RESTful API 文档',
  },
} as const

export const GET = ApiReference(config)
