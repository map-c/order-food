# API 文档集成实施总结

## 项目概述

为餐馆点餐系统成功集成了 **Swagger/OpenAPI + Scalar** API 文档解决方案。

## 实施方案

### 选择方案：next-swagger-doc + Scalar

**为什么选择这个方案？**

✅ **最小侵入性**：无需重构现有代码，只需添加 JSDoc 注释
✅ **成熟稳定**：基于 OpenAPI 3.0.3 标准
✅ **现代 UI**：Scalar 提供美观的交互式文档界面
✅ **易于维护**：文档注释与代码在同一文件，同步更新
✅ **完全兼容**：支持 Next.js 15 App Router

**对比其他方案**：

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| next-rest-framework | 类型安全、自动生成 | 需要大量重构现有代码 | ❌ 工作量太大 |
| next-swagger-doc | 最小改动、灵活 | 需手动维护注释 | ✅ 最适合 |
| 手动编写 OpenAPI | 完全控制 | 维护成本极高 | ❌ 不推荐 |

## 技术栈

```json
{
  "next-swagger-doc": "^0.4.1",        // OpenAPI 规范生成
  "@scalar/nextjs-api-reference": "^0.8.21",  // 文档 UI
  "swagger-ui-react": "^5.29.3"        // 备用 Swagger UI
}
```

## 实施成果

### ✅ 已完成的工作

1. **依赖安装**
   - 安装 `next-swagger-doc`、`@scalar/nextjs-api-reference`

2. **核心配置文件**
   - [lib/swagger.ts](../lib/swagger.ts) - OpenAPI 规范配置
   - [app/api/openapi/route.ts](../app/api/openapi/route.ts) - OpenAPI JSON 端点
   - [app/api-docs/route.ts](../app/api-docs/route.ts) - Scalar 文档页面

3. **文档注释（示例）**
   - ✅ GET /api/dishes - 获取菜品列表
   - ✅ POST /api/dishes - 创建菜品
   - ✅ GET /api/categories - 获取分类列表
   - ✅ POST /api/auth/login - 用户登录

4. **指南文档**
   - [docs/API文档注释指南.md](./API文档注释指南.md) - 详细的注释模板和指南

5. **项目文档更新**
   - 更新 [CLAUDE.md](../CLAUDE.md) 添加 API 文档章节
   - 添加常用命令和访问地址

### 🎯 访问地址

| 用途 | 地址 | 说明 |
|------|------|------|
| 交互式文档 | http://localhost:3000/api-docs | Scalar UI，可直接测试 API |
| OpenAPI 规范 | http://localhost:3000/api/openapi | JSON 格式，可导入 Postman 等工具 |

### 📊 文档完成度

**已文档化 API**：4 个
**待文档化 API**：~14 个

| 模块 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| 菜品 | 2/3 | 3 | 66% |
| 分类 | 1/1 | 1 | 100% |
| 认证 | 1/4 | 4 | 25% |
| 桌台 | 0/4 | 4 | 0% |
| 订单 | 0/4 | 4 | 0% |
| 报表 | 0/4 | 4 | 0% |
| 其他 | 0/2 | 2 | 0% |

## OpenAPI 规范结构

```yaml
openapi: 3.0.3
info:
  title: 餐馆点餐系统 API
  version: 1.0.0
  description: 单店版餐馆管理系统的 RESTful API 文档

servers:
  - url: http://localhost:3000
    description: 开发环境
  - url: https://your-production-domain.com
    description: 生产环境

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    # 通用响应格式
    SuccessResponse: {...}
    ErrorResponse: {...}

    # 业务实体
    Category: {...}
    Dish: {...}
    Table: {...}
    Order: {...}
    OrderItem: {...}
    User: {...}

tags:
  - 认证
  - 菜品
  - 分类
  - 桌台
  - 订单
  - 报表
  - 仪表板
  - OSS
```

## 后续工作

### 📝 待补充文档的 API

**优先级 P0（核心功能）**：
- [ ] GET /api/dishes/[id]
- [ ] PATCH /api/dishes/[id]
- [ ] DELETE /api/dishes/[id]
- [ ] GET /api/orders
- [ ] POST /api/orders
- [ ] PATCH /api/orders/[id]/status

**优先级 P1（常用功能）**：
- [ ] GET /api/tables
- [ ] POST /api/tables
- [ ] PATCH /api/tables/[id]
- [ ] DELETE /api/tables/[id]
- [ ] POST /api/auth/refresh
- [ ] GET /api/auth/me

**优先级 P2（辅助功能）**：
- [ ] GET /api/dashboard
- [ ] GET /api/reports/*（4个报表接口）
- [ ] GET /api/oss/sts

### 🔧 可选优化

1. **自动化生成**
   - 考虑使用 `zod-to-openapi` 从 Zod schemas 自动生成部分规范
   - 减少手动维护工作量

2. **CI/CD 集成**
   - 在 build 时生成静态 OpenAPI 文件
   - 部署文档到专门的文档站点

3. **API 测试集成**
   - 基于 OpenAPI 规范自动生成 API 测试
   - 确保文档与实际行为一致

4. **多语言支持**
   - 添加英文版 API 文档
   - 支持国际化

## 使用指南

### 如何添加新 API 的文档

1. **打开对应的 route.ts 文件**

2. **在 handler 函数前添加 JSDoc 注释**：

   ```typescript
   /**
    * @swagger
    * /api/your-endpoint:
    *   get:
    *     summary: API 简要说明
    *     tags:
    *       - 标签名称
    *     parameters:
    *       - in: query
    *         name: paramName
    *         schema:
    *           type: string
    *     responses:
    *       200:
    *         description: 成功响应
    */
   export async function GET(request: NextRequest) {
     // ...
   }
   ```

3. **参考模板**：详见 [API文档注释指南.md](./API文档注释指南.md)

4. **测试文档**：
   - 启动开发服务器：`pnpm dev`
   - 访问：http://localhost:3000/api-docs
   - 验证新添加的 API 是否正确显示

### 如何使用文档

**开发者**：
1. 访问 http://localhost:3000/api-docs
2. 浏览 API 列表
3. 点击具体接口查看详情
4. 使用"Try it out"功能测试 API
5. 查看请求/响应示例

**前端开发者**：
1. 查看 API 端点和参数
2. 了解请求/响应格式
3. 复制示例代码

**第三方集成**：
1. 下载 OpenAPI JSON：http://localhost:3000/api/openapi
2. 导入到 Postman/Insomnia 等工具
3. 自动生成客户端代码（使用 openapi-generator）

## 技术细节

### OpenAPI 规范生成流程

```mermaid
graph LR
    A[API Route Files] --> B[@swagger JSDoc]
    B --> C[next-swagger-doc]
    C --> D[OpenAPI JSON]
    D --> E[/api/openapi endpoint]
    E --> F[Scalar UI]
    F --> G[Interactive Docs]
```

### 核心代码解析

**lib/swagger.ts**：
```typescript
import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',  // 扫描 app/api 目录
    definition: {
      openapi: '3.0.3',
      info: { ... },
      components: { ... },
      tags: [ ... ]
    }
  })
  return spec
}
```

**app/api/openapi/route.ts**：
```typescript
import { getApiDocs } from '@/lib/swagger'

export async function GET() {
  const spec = getApiDocs()
  return NextResponse.json(spec)
}
```

**app/api-docs/route.ts**：
```typescript
import { ApiReference } from '@scalar/nextjs-api-reference'

export const GET = ApiReference({
  spec: { url: '/api/openapi' },
  theme: 'purple',
  layout: 'modern'
})
```

## 最佳实践

### 1. 注释规范

✅ **推荐**：
- 使用清晰的 summary 和 description
- 提供 example 值
- 引用已定义的 schemas
- 标注安全要求（security）

❌ **不推荐**：
- 过于冗长的描述
- 缺少示例值
- 重复定义 schemas

### 2. Schema 管理

- 将通用 schemas 定义在 `lib/swagger.ts` 的 components.schemas 中
- 使用 `$ref` 引用，避免重复
- 保持 schema 与 Zod 验证一致

### 3. 文档维护

- 代码变更时同步更新文档注释
- 定期检查文档完整性
- 使用 `/api-docs` 验证文档正确性

## 常见问题

### Q: 为什么选择 Scalar 而不是 Swagger UI？

A: Scalar 提供了更现代的 UI 设计、更好的性能和更丰富的交互功能。同时，我们也保留了 `swagger-ui-react` 依赖作为备选方案。

### Q: 如何处理需要认证的 API？

A: 在 JSDoc 中添加 `security` 字段：
```yaml
security:
  - BearerAuth: []
```
用户在 Scalar UI 中点击"Authorize"按钮输入 JWT token。

### Q: 文档可以导出吗？

A: 可以。访问 `/api/openapi` 获取 JSON 格式的 OpenAPI 规范，可导入到 Postman、Insomnia 等工具，也可使用 openapi-generator 生成客户端 SDK。

### Q: next-swagger-doc 如何发现注释？

A: 它会扫描 `apiFolder` 指定的目录（`app/api`），查找所有包含 `@swagger` 标记的 JSDoc 注释，并解析为 OpenAPI 规范。

## 总结

✅ **成功集成了完整的 API 文档系统**
✅ **提供了现代化的交互式文档界面**
✅ **最小化了对现有代码的改动**
✅ **建立了可扩展的文档维护流程**

📌 **下一步行动**：
1. 按优先级补充剩余 API 的文档注释
2. 在团队中推广文档使用
3. 将文档链接添加到项目 README

## 相关链接

- [Scalar 官方文档](https://scalar.com/)
- [next-swagger-doc GitHub](https://github.com/jellydn/next-swagger-doc)
- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [项目 API 文档注释指南](./API文档注释指南.md)
