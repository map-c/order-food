# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**餐馆点餐系统** - 单店版 Web 管理后台，面向独立餐馆店主、前厅与后厨员工的点餐与管理系统。

技术栈：
- Next.js 15.2.4 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4.x
- shadcn/ui 组件库（基于 Radix UI）
- React Hook Form + Zod 表单验证
- Recharts 数据可视化
- Prisma ORM（数据库访问层）
- JWT 鉴权（已实现）
- SWR 数据获取

## 常用命令

```bash
# 开发
pnpm dev           # 启动开发服务器

# 构建和生产
pnpm build         # 构建生产版本
pnpm start         # 启动生产服务器

# 代码质量
pnpm lint          # 运行 ESLint 检查

# 数据库（使用 Prisma）
pnpm db:migrate        # 创建并应用数据库迁移（开发环境）
pnpm db:seed           # 运行种子数据脚本
pnpm db:studio         # 启动数据库可视化界面
npx prisma generate    # 生成 Prisma Client（修改 schema 后需执行）

# API 文档
# 访问 http://localhost:3000/api-docs 查看交互式 API 文档
# 访问 http://localhost:3000/api/openapi 获取 OpenAPI JSON 规范
```

## 环境配置

项目需要配置 `.env` 文件（不提交到 Git），参考 `.env.example`：

```bash
# 数据库连接（PostgreSQL）
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db?schema=public"

# JWT 认证配置
JWT_SECRET="your-secret-key-change-in-production-min-32-characters"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# 阿里云 OSS 配置（用于图片上传）
ALIYUN_ACCESS_KEY_ID="你的 AccessKey ID"
ALIYUN_ACCESS_KEY_SECRET="你的 AccessKey Secret"
ALIYUN_OSS_REGION="oss-cn-hangzhou"
ALIYUN_OSS_BUCKET="你的 Bucket 名称"
ALIYUN_OSS_ENDPOINT="https://你的bucket.oss-cn-hangzhou.aliyuncs.com"
```

**首次启动步骤**：
1. 复制 `.env.example` 到 `.env` 并填入配置
2. `pnpm install` - 安装依赖（会自动执行 `prisma generate`）
3. `pnpm db:migrate` - 创建数据库表结构
4. `pnpm db:seed` - 填充测试数据
5. `pnpm dev` - 启动开发服务器

**默认登录账号**（由种子数据创建）：
- 用户名: `admin`
- 密码: `admin123`

## 项目架构

### 目录结构

```
/app                 # Next.js App Router 页面
  /page.tsx         # 首页看板（Dashboard）
  /pos              # 点餐收银
  /orders           # 订单管理
  /dishes           # 菜品管理
  /tables           # 桌台管理
  /reports          # 报表中心
  /settings         # 系统设置
  /api              # API 路由
    /dishes         # ✅ 菜品 API（已实现）
    /categories     # ✅ 分类 API（已实现）
    /oss/sts        # ✅ OSS 临时凭证 API（已实现）
    /tables         # ✅ 桌台 API（已实现）
    /orders         # ✅ 订单 API（已实现）
    /auth           # ✅ 认证 API（已实现）
    /reports        # ✅ 报表 API（示例已实现）
    /stats          # 统计数据 API（计划中）
  /layout.tsx       # 根布局
  /globals.css      # 全局样式

/components          # React 组件
  /layout           # 布局组件（TopNav 等）
  /dashboard        # 仪表板组件（统计卡片、图表等）
  /pos              # 点餐收银组件（菜品网格、购物车、桌台选择器）
  /orders           # 订单管理组件
  /dishes           # 菜品管理组件
  /tables           # 桌台管理组件
  /reports          # 报表组件（收入图表、热销菜品等）
  /ui               # shadcn/ui 基础 UI 组件库

/lib                 # 工具函数
  /utils.ts         # ✅ cn() 函数用于 className 合并
  /prisma.ts        # ✅ Prisma Client 实例
  /api-client.ts    # ✅ API 请求封装
  /api-response.ts  # ✅ API 响应工具
  /oss-client.ts    # ✅ 阿里云 OSS 上传客户端
  /jwt.ts           # ✅ JWT Token 工具
  /password.ts      # ✅ 密码加密工具
  /auth-middleware.ts # ✅ 认证中间件
  /auth-context.tsx # ✅ 认证上下文
  /date-utils.ts    # ✅ 日期处理工具

/prisma              # Prisma 配置
  /schema.prisma    # ✅ 数据库 Schema 定义
  /migrations/      # ✅ 数据库迁移文件
  /seed.ts          # ✅ 种子数据脚本

/types               # TypeScript 类型定义
  /oss.ts           # ✅ OSS 相关类型定义
  /auth.ts          # ✅ 认证相关类型定义
  /reports.ts       # ✅ 报表相关类型定义
```

### 路径别名

使用 `@/` 作为项目根目录的别名：
```typescript
import { TopNav } from "@/components/layout/top-nav"
import { cn } from "@/lib/utils"
```

### UI 组件系统

本项目使用 shadcn/ui 组件库：
- 所有基础 UI 组件位于 `/components/ui`
- 使用 Radix UI 原语构建
- 通过 `cn()` 工具函数支持 Tailwind CSS 类名合并
- 组件配置文件：`components.json`

### 样式规范

设计系统颜色：
- 主色调：`#1E90FF`（蓝色）
- 成功色：`#28C76F`（绿色）
- 错误色：`#EA5455`（红色）
- 文本主色：`#333333`
- 文本次要色：`#6B7280`
- 背景灰：`#F0F2F5`
- 边框灰：`#E0E6ED`

字体：
- 主字体：Geist Sans
- 等宽字体：Geist Mono

### 核心功能模块

1. **首页看板** (`/`)
   - 实时统计数据（今日营业额、订单数、客流量）
   - 销售趋势图表
   - 热门菜品排行
   - 最近订单列表

2. **点餐收银** (`/pos`)
   - 三栏布局：桌台选择器 | 菜品网格 | 订单购物车
   - 菜品分类筛选和搜索
   - 购物车实时计算
   - 支持沽清状态显示

3. **订单管理** (`/orders`)
   - 订单列表和筛选
   - 订单状态管理（待接单、制作中、已完成）

4. **菜品管理** (`/dishes`)
   - 菜品 CRUD 操作
   - 分类管理
   - 库存和价格管理

5. **桌台管理** (`/tables`)
   - 桌台网格视图
   - 桌台状态（空闲、占用、预留）
   - 二维码生成（用于顾客扫码点餐）

6. **报表中心** (`/reports`)
   - 营收统计图表
   - 菜品销售分析
   - 时段分析
   - 数据导出

### 客户端组件约定

- 所有需要交互、状态或浏览器 API 的组件使用 `"use client"` 指令
- 页面级组件优先使用服务端组件
- 导航组件（TopNav）使用 `usePathname` 钩子实现路由高亮

### API 架构设计

#### API 路由规范

使用 Next.js App Router 的 Route Handlers 实现 RESTful API：

**基础路径**：`/api/*`

**主要端点**：
- `GET /api/dishes` - 获取菜品列表（支持分类、搜索、可用性筛选）
- `POST /api/dishes` - 创建菜品
- `GET /api/dishes/[id]` - 获取单个菜品
- `PATCH /api/dishes/[id]` - 更新菜品
- `DELETE /api/dishes/[id]` - 删除菜品
- `GET /api/orders` - 获取订单列表（支持状态、桌台、日期筛选）
- `POST /api/orders` - 创建订单
- `PATCH /api/orders/[id]/status` - 更新订单状态
- `GET /api/tables` - 获取桌台列表
- `GET /api/stats` - 获取首页统计数据
- `GET /api/reports/daily` - 获取日报表数据

**统一响应格式**：
```typescript
// 成功响应
{ success: true, data: T, message?: string }

// 错误响应
{ success: false, error: { code: string, message: string } }
```

**数据验证**：使用 Zod Schema 验证所有 API 输入

#### 数据库设计

使用 Prisma ORM + PostgreSQL：

**核心模型**：
- `User` - 用户（店主、经理、员工）
- `Category` - 菜品分类
- `Dish` - 菜品
- `Table` - 桌台
- `Order` - 订单
- `OrderItem` - 订单项

**关系**：
- 一个订单包含多个订单项（一对多）
- 一个订单关联一个桌台（多对一）
- 一个菜品属于一个分类（多对一）

详细设计参见：`docs/Next.js API路由实现方案.md`

### 数据获取策略

#### 前端数据请求

使用 SWR（stale-while-revalidate）进行数据获取：

```typescript
import useSWR from 'swr'

const { data, error, isLoading, mutate } = useSWR('/api/dishes', fetcher)
```

**优势**：
- 自动缓存和重新验证
- 乐观更新（Optimistic UI）
- 请求去重和轮询支持
- 离线支持

#### 服务端数据获取

页面级使用 Server Components 直接查询数据库：

```typescript
// app/dishes/page.tsx
import { prisma } from '@/lib/prisma'

export default async function DishesPage() {
  const dishes = await prisma.dish.findMany()
  return <DishTable dishes={dishes} />
}
```

### 图片上传功能

项目集成了阿里云 OSS 直传功能，用于菜品图片等静态资源的上传：

**实现方案**：
- 后端通过 STS 服务提供临时凭证（`/api/oss/sts`）
- 前端使用临时凭证直传 OSS，避免文件经过服务器
- 支持拖拽上传、进度显示、文件类型和大小验证
- 上传工具函数：`lib/oss-client.ts`

**使用示例**：
```typescript
import { uploadToOSS, validateImageFile } from '@/lib/oss-client'

const result = await uploadToOSS({
  file,
  pathPrefix: 'dishes/',
  onProgress: (percent) => console.log(`上传进度: ${percent}%`)
})
```

### 数据库实现进度

**已完成**：
- ✅ Prisma + PostgreSQL 数据库配置
- ✅ 数据模型定义（User、Category、Dish、Table、Order、OrderItem）
- ✅ 菜品管理 API（CRUD 完整实现）
- ✅ 分类管理 API
- ✅ 桌台管理 API（CRUD 完整实现，支持状态管理）
- ✅ 订单管理 API（CRUD 完整实现，支持状态更新）
- ✅ 前端使用 SWR 进行数据获取和缓存
- ✅ 阿里云 OSS 图片上传集成

**待实现**：
- ⏳ 统计数据 API（首页看板）
- ⏳ 报表数据导出（Excel/PDF）
- ⏳ 实时订单推送（Pusher/WebSocket）

参考文档：
- [Next.js API路由实现方案.md](docs/Next.js API路由实现方案.md)
- [阿里云OSS图片上传集成.md](docs/阿里云OSS图片上传集成.md)
- [鉴权系统实现总结.md](docs/鉴权系统实现总结.md)
- [报表模块实现文档.md](docs/报表模块实现文档.md)
- [Vercel部署问题与解决方案.md](docs/Vercel部署问题与解决方案.md)
- [API文档注释指南.md](docs/API文档注释指南.md) 📖

### 认证与鉴权

**实现方案**：基于 JWT 的鉴权系统

**核心文件**：
- [lib/jwt.ts](lib/jwt.ts) - JWT 生成和验证工具
- [lib/password.ts](lib/password.ts) - bcrypt 密码加密
- [lib/auth-middleware.ts](lib/auth-middleware.ts) - API 路由鉴权中间件
- [lib/auth-context.tsx](lib/auth-context.tsx) - 前端认证上下文

**使用示例**：
```typescript
// API 路由鉴权
import { authenticateRequest } from '@/lib/auth-middleware'

export async function GET(req: Request) {
  const { user, error } = await authenticateRequest(req)
  if (error) return error
  // ...
}

// 前端使用认证
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, login, logout } = useAuth()
  // ...
}
```

### 性能优化建议

- 使用 Next.js Image 组件优化图片加载
- 利用 React.Suspense 实现组件级加载状态
- 考虑使用 React Server Components 减少客户端 JavaScript
- API 路由使用 `revalidate` 配置缓存策略
- 数据库查询优化：使用 Prisma 的 `select` 和 `include` 精确获取字段
- 考虑使用 Edge Runtime 加速 API 响应

## 代码规范与已知问题

### TypeScript 严格模式

项目启用了 TypeScript 严格模式 (`strict: true`)，所有代码应遵循：
- 避免使用 `any` 类型，优先使用具体类型或 `unknown`
- API 路由的 where 条件使用 Prisma 生成的类型（如 `Prisma.DishWhereInput`）
- 事件处理器使用明确的事件类型（如 `MouseEvent<HTMLButtonElement>`）
- 错误处理使用 `unknown` 类型，通过 `instanceof Error` 进行类型收窄

### 常见类型定义

```typescript
// API 响应类型
import { Prisma } from '@prisma/client'

// 查询条件
const where: Prisma.DishWhereInput = {}

// 事件处理
import { MouseEvent } from 'react'
onClick={(e: MouseEvent<HTMLButtonElement>) => e.stopPropagation()}

// 错误处理
catch (error: unknown) {
  const message = error instanceof Error ? error.message : '未知错误'
}
```

### TypeScript 类型错误修复

项目中存在一些待修复的类型问题，详见 [docs/TypeScript类型错误修复清单.md](docs/TypeScript类型错误修复清单.md)

**修复优先级**：
- P0：API 路由和 lib 工具的 `any` 类型
- P1：组件事件处理器的 `any` 类型
- P2：未使用的变量和最佳实践警告

### 数据库说明

项目使用 **PostgreSQL** 数据库：
- 开发环境：本地 PostgreSQL 或使用 Docker 快速启动
- 生产环境：推荐使用 Vercel Postgres、Supabase 或 Neon
- 不支持 SQLite（生产环境需要关系型数据库的完整特性）

**本地 PostgreSQL 快速启动**（使用 Docker）：
```bash
docker run --name restaurant-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=restaurant_db \
  -p 5432:5432 \
  -d postgres:15
```

### API 文档系统

项目集成了 **Swagger/OpenAPI + Scalar** 作为 API 文档解决方案：

**技术栈**：
- `next-swagger-doc` - 从 JSDoc 注释生成 OpenAPI 规范
- `@scalar/nextjs-api-reference` - 现代美观的 API 文档 UI

**访问地址**：
- 交互式文档：http://localhost:3000/api-docs（使用 Scalar UI）
- OpenAPI 规范：http://localhost:3000/api/openapi（JSON 格式）

**核心文件**：
- [lib/swagger.ts](lib/swagger.ts) - OpenAPI 规范配置和生成
- [app/api-docs/route.ts](app/api-docs/route.ts) - Scalar 文档页面路由
- [app/api/openapi/route.ts](app/api/openapi/route.ts) - OpenAPI JSON 端点

**添加文档注释**：
在 API 路由文件中使用 JSDoc `@swagger` 注释，例如：

```typescript
/**
 * @swagger
 * /api/dishes:
 *   get:
 *     summary: 获取菜品列表
 *     tags:
 *       - 菜品
 *     responses:
 *       200:
 *         description: 成功返回菜品列表
 */
export async function GET(request: NextRequest) {
  // ...
}
```

详细指南参见 [docs/API文档注释指南.md](docs/API文档注释指南.md)

**文档状态**：
- ✅ 已完成：GET /api/dishes, POST /api/dishes, GET /api/categories, POST /api/auth/login
- ⏳ 待补充：其他 API 路由（参见指南文档）

### Vercel 部署注意事项

部署到 Vercel 时需注意的问题，详见 [docs/Vercel部署问题与解决方案.md](docs/Vercel部署问题与解决方案.md)：
- 配置 Vercel Postgres 或其他 PostgreSQL 数据库
- 配置环境变量（DATABASE_URL、JWT_SECRET、OSS 配置等）
- build 命令会自动执行 `prisma generate`
- 首次部署后需在 Vercel 中手动执行数据库迁移
