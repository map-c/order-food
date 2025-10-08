# API 文档快速开始指南

## 🚀 5 分钟上手

### 1. 启动项目

```bash
pnpm dev
```

### 2. 访问文档

在浏览器中打开：
- **交互式文档**：http://localhost:3000/api-docs
- **OpenAPI JSON**：http://localhost:3000/api/openapi

### 3. 测试 API

1. 点击任意 API 端点（例如 `GET /api/dishes`）
2. 点击右侧的 **"Try it out"** 按钮
3. 填写参数（如果需要）
4. 点击 **"Execute"** 发送请求
5. 查看响应结果

### 4. 认证测试

对于需要认证的 API：

1. 先调用 `POST /api/auth/login` 登录：
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

2. 复制返回的 `token` 值

3. 点击页面顶部的 **"Authorize"** 按钮

4. 在弹出框中输入：`Bearer <your-token>`

5. 点击 **"Authorize"**，现在可以调用需要认证的 API

## 📝 添加新 API 文档

### 最简单的示例

在你的 API 路由文件（如 `app/api/example/route.ts`）中：

```typescript
import { NextRequest } from 'next/server'

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: 示例接口
 *     tags:
 *       - 示例
 *     responses:
 *       200:
 *         description: 成功
 */
export async function GET(request: NextRequest) {
  return Response.json({ message: 'Hello' })
}
```

刷新文档页面，你的新 API 就会出现！

### 带参数的示例

```typescript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: 带参数的示例
 *     tags:
 *       - 示例
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: 页码
 *     responses:
 *       200:
 *         description: 成功返回列表
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
 *                     type: object
 */
export async function GET(request: NextRequest) {
  // ...
}
```

### POST 请求示例

```typescript
/**
 * @swagger
 * /api/example:
 *   post:
 *     summary: 创建资源
 *     tags:
 *       - 示例
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: 示例名称
 *               description:
 *                 type: string
 *                 example: 示例描述
 *     responses:
 *       201:
 *         description: 创建成功
 */
export async function POST(request: NextRequest) {
  // ...
}
```

### 需要认证的 API

```typescript
/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: 需要认证的接口
 *     tags:
 *       - 示例
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 */
export async function GET(request: NextRequest) {
  // ...
}
```

## 🎯 常用标签

根据功能模块选择合适的标签：

- `认证` - 登录、登出、刷新令牌
- `菜品` - 菜品管理
- `分类` - 分类管理
- `桌台` - 桌台管理
- `订单` - 订单管理
- `报表` - 数据报表
- `仪表板` - 首页统计
- `OSS` - 图片上传

## 📚 更多示例

查看已完成的 API 文档注释：

- [app/api/dishes/route.ts](../app/api/dishes/route.ts) - 完整的 GET/POST 示例
- [app/api/categories/route.ts](../app/api/categories/route.ts) - 简单的 GET 示例
- [app/api/auth/login/route.ts](../app/api/auth/login/route.ts) - 登录接口示例

完整模板和指南：[API文档注释指南.md](./API文档注释指南.md)

## 🔧 常见问题

### 文档没有更新？

1. 确保保存了文件
2. 刷新浏览器页面（Ctrl/Cmd + R）
3. 如果还是没更新，重启开发服务器

### Schema 引用怎么用？

在 `lib/swagger.ts` 中已定义了常用 schemas：

```yaml
$ref: '#/components/schemas/Dish'        # 菜品
$ref: '#/components/schemas/Category'    # 分类
$ref: '#/components/schemas/Table'       # 桌台
$ref: '#/components/schemas/Order'       # 订单
$ref: '#/components/schemas/User'        # 用户
$ref: '#/components/schemas/SuccessResponse'  # 成功响应
$ref: '#/components/schemas/ErrorResponse'    # 错误响应
```

### 怎么测试有文件上传的 API？

```typescript
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: 上传文件
 *     tags:
 *       - OSS
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
```

## ✅ 下一步

1. 参考示例为你的 API 添加文档注释
2. 在 `/api-docs` 中测试和验证
3. 提交代码时记得同步更新文档注释

## 📖 相关文档

- [API文档注释指南.md](./API文档注释指南.md) - 详细的注释模板
- [API文档集成总结.md](./API文档集成总结.md) - 技术方案和实施细节
- [CLAUDE.md](../CLAUDE.md) - 项目整体文档
