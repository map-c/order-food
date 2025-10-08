import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.3',
      info: {
        title: '餐馆点餐系统 API',
        version: '1.0.0',
        description: `
## 简介

单店版餐馆管理系统的 RESTful API 文档。

## 认证

API 使用 JWT (JSON Web Token) 进行身份验证。

### 获取 Token

通过 \`POST /api/auth/login\` 接口登录获取访问令牌。

### 使用 Token

在请求头中携带 Authorization 字段：

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

### 刷新 Token

访问令牌过期后，使用刷新令牌通过 \`POST /api/auth/refresh\` 获取新的访问令牌。

## 响应格式

所有 API 响应遵循统一格式：

### 成功响应
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
\`\`\`

### 错误响应
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
\`\`\`

## 常见错误码

- \`VALIDATION_ERROR\` (422) - 请求参数验证失败
- \`UNAUTHORIZED\` (401) - 未授权访问
- \`FORBIDDEN\` (403) - 无权限操作
- \`NOT_FOUND\` (404) - 资源不存在
- \`INTERNAL_ERROR\` (500) - 服务器内部错误
        `,
        contact: {
          name: 'API Support',
          email: 'support@restaurant-system.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: '开发环境',
        },
        {
          url: 'https://your-production-domain.com',
          description: '生产环境',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT 认证令牌',
          },
        },
        schemas: {
          // 通用响应格式
          SuccessResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              data: {
                type: 'object',
              },
              message: {
                type: 'string',
                example: '操作成功',
              },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false,
              },
              error: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    example: 'VALIDATION_ERROR',
                  },
                  message: {
                    type: 'string',
                    example: '请求参数验证失败',
                  },
                },
              },
            },
          },
          // 分类
          Category: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clxyz123456' },
              name: { type: 'string', example: '热菜' },
              icon: { type: 'string', nullable: true, example: '🍲' },
              sortOrder: { type: 'number', example: 1 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          // 菜品
          Dish: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clxyz123456' },
              name: { type: 'string', example: '宫保鸡丁' },
              categoryId: { type: 'string', example: 'clxyz123456' },
              price: { type: 'number', example: 38.0 },
              image: { type: 'string', format: 'uri', example: 'https://example.com/dish.jpg' },
              description: { type: 'string', nullable: true, example: '经典川菜' },
              isAvailable: { type: 'boolean', example: true },
              isSoldOut: { type: 'boolean', example: false },
              stock: { type: 'number', nullable: true, example: 50 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              category: { $ref: '#/components/schemas/Category' },
            },
          },
          // 桌台
          Table: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clxyz123456' },
              number: { type: 'string', example: 'A01' },
              capacity: { type: 'number', example: 4 },
              status: { type: 'string', enum: ['available', 'occupied', 'reserved'], example: 'available' },
              qrCode: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          // 订单
          Order: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clxyz123456' },
              orderNumber: { type: 'string', example: 'ORD20250101-001' },
              tableId: { type: 'string', example: 'clxyz123456' },
              status: { type: 'string', enum: ['pending', 'preparing', 'completed', 'cancelled'], example: 'pending' },
              totalAmount: { type: 'number', example: 168.0 },
              notes: { type: 'string', nullable: true },
              userId: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              table: { $ref: '#/components/schemas/Table' },
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/OrderItem' },
              },
            },
          },
          OrderItem: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              dishId: { type: 'string' },
              quantity: { type: 'number', example: 2 },
              price: { type: 'number', example: 38.0 },
              subtotal: { type: 'number', example: 76.0 },
              dish: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string', example: '宫保鸡丁' },
                  image: { type: 'string' },
                },
              },
            },
          },
          // 用户
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: '张三' },
              email: { type: 'string', format: 'email', example: 'admin@example.com' },
              role: { type: 'string', enum: ['owner', 'manager', 'staff'], example: 'manager' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      tags: [
        { name: '认证', description: '用户认证相关接口' },
        { name: '菜品', description: '菜品管理相关接口' },
        { name: '分类', description: '菜品分类管理相关接口' },
        { name: '桌台', description: '桌台管理相关接口' },
        { name: '订单', description: '订单管理相关接口' },
        { name: '报表', description: '数据报表相关接口' },
        { name: '仪表板', description: '首页统计数据接口' },
        { name: 'OSS', description: '阿里云 OSS 图片上传相关接口' },
      ],
      security: [],
    },
  })
  return spec
}
