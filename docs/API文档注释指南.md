# API 文档注释指南

本文档说明如何为 Next.js App Router API 添加 Swagger/OpenAPI 文档注释。

## 已完成的 API

- ✅ GET /api/dishes - 获取菜品列表
- ✅ POST /api/dishes - 创建菜品
- ✅ GET /api/categories - 获取分类列表
- ✅ POST /api/auth/login - 用户登录

## 待添加文档的 API

### 菜品相关
- ⏳ GET /api/dishes/[id] - 获取单个菜品
- ⏳ PATCH /api/dishes/[id] - 更新菜品
- ⏳ DELETE /api/dishes/[id] - 删除菜品

### 桌台相关
- ⏳ GET /api/tables - 获取桌台列表
- ⏳ POST /api/tables - 创建桌台
- ⏳ PATCH /api/tables/[id] - 更新桌台
- ⏳ DELETE /api/tables/[id] - 删除桌台

### 订单相关
- ⏳ GET /api/orders - 获取订单列表
- ⏳ POST /api/orders - 创建订单
- ⏳ GET /api/orders/[id] - 获取单个订单
- ⏳ PATCH /api/orders/[id]/status - 更新订单状态

### 认证相关
- ⏳ POST /api/auth/refresh - 刷新令牌
- ⏳ POST /api/auth/logout - 用户登出
- ⏳ GET /api/auth/me - 获取当前用户信息

### 报表相关
- ⏳ GET /api/reports/overview - 概览统计
- ⏳ GET /api/reports/revenue - 营收报表
- ⏳ GET /api/reports/dishes - 菜品销售报表
- ⏳ GET /api/reports/hourly - 时段分析

### 其他
- ⏳ GET /api/dashboard - 首页统计数据
- ⏳ GET /api/oss/sts - 获取 OSS STS 临时凭证

## JSDoc 注释模板

### GET 请求示例（列表）

```typescript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: 获取资源列表
 *     description: 获取所有资源，支持筛选和搜索
 *     tags:
 *       - 资源分类
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: 参数说明
 *     responses:
 *       200:
 *         description: 成功返回资源列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ResourceSchema'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request: NextRequest) {
```

### POST 请求示例（创建）

```typescript
/**
 * @swagger
 * /api/resource:
 *   post:
 *     summary: 创建资源
 *     description: 创建一个新的资源
 *     tags:
 *       - 资源分类
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *               - field2
 *             properties:
 *               field1:
 *                 type: string
 *                 description: 字段1说明
 *                 example: 示例值
 *               field2:
 *                 type: number
 *                 description: 字段2说明
 *                 example: 100
 *     responses:
 *       201:
 *         description: 资源创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ResourceSchema'
 *                 message:
 *                   type: string
 *                   example: 资源创建成功
 *       422:
 *         description: 参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: NextRequest) {
```

### PATCH 请求示例（更新）

```typescript
/**
 * @swagger
 * /api/resource/{id}:
 *   patch:
 *     summary: 更新资源
 *     description: 更新指定ID的资源
 *     tags:
 *       - 资源分类
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 资源ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *                 description: 字段1说明（可选更新）
 *     responses:
 *       200:
 *         description: 资源更新成功
 *       404:
 *         description: 资源不存在
 *       422:
 *         description: 参数验证失败
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
```

### DELETE 请求示例

```typescript
/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: 删除资源
 *     description: 删除指定ID的资源
 *     tags:
 *       - 资源分类
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 资源ID
 *     responses:
 *       200:
 *         description: 资源删除成功
 *       404:
 *         description: 资源不存在
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
```

## 注意事项

1. **tags 分类**：使用中文标签，与 `lib/swagger.ts` 中定义的 tags 保持一致
2. **security**：需要认证的接口添加 `security: [{ BearerAuth: [] }]`
3. **schema 引用**：使用 `$ref: '#/components/schemas/SchemaName'` 引用已定义的 schema
4. **响应格式**：遵循统一的响应格式（SuccessResponse/ErrorResponse）
5. **示例值**：尽量提供 `example` 字段，便于测试

## 可用的 Schema 定义

在 `lib/swagger.ts` 中已定义的 schemas：

- `SuccessResponse` - 成功响应格式
- `ErrorResponse` - 错误响应格式
- `Category` - 分类
- `Dish` - 菜品
- `Table` - 桌台
- `Order` - 订单
- `OrderItem` - 订单项
- `User` - 用户

## 查看文档

- OpenAPI JSON 规范：http://localhost:3000/api/openapi
- Scalar 交互式文档：http://localhost:3000/api-docs

## 自动生成工具

未来可以考虑使用工具自动从 Zod schemas 生成 OpenAPI 规范：

- `zod-to-openapi` - 从 Zod schema 生成 OpenAPI schema
- `@anatine/zod-openapi` - Zod OpenAPI 集成
