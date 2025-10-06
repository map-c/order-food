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
- NextAuth.js（身份认证，计划中）

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
```

## 环境配置

项目需要配置 `.env` 文件（不提交到 Git），包含以下变量：

```bash
# 数据库连接（SQLite）
DATABASE_URL="file:./dev.db"

# 阿里云 OSS 配置（用于图片上传）
ALIYUN_ACCESS_KEY_ID="你的 AccessKey ID"
ALIYUN_ACCESS_KEY_SECRET="你的 AccessKey Secret"
ALIYUN_OSS_REGION="oss-cn-hangzhou"
ALIYUN_OSS_BUCKET="你的 Bucket 名称"
ALIYUN_OSS_ENDPOINT="https://你的bucket.oss-cn-hangzhou.aliyuncs.com"
```

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
    /orders         # 订单 API（计划中）
    /stats          # 统计数据 API（计划中）
    /reports        # 报表 API（计划中）
    /auth           # 认证 API（计划中）
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

/prisma              # Prisma 配置
  /schema.prisma    # ✅ 数据库 Schema 定义
  /migrations/      # ✅ 数据库迁移文件
  /seed.ts          # ✅ 种子数据脚本

/types               # TypeScript 类型定义
  /oss.ts           # ✅ OSS 相关类型定义
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

使用 Prisma ORM + PostgreSQL/SQLite：

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
- ✅ Prisma + SQLite 数据库配置
- ✅ 数据模型定义（User、Category、Dish、Table、Order、OrderItem）
- ✅ 菜品管理 API（CRUD 完整实现）
- ✅ 分类管理 API
- ✅ 桌台管理 API（CRUD 完整实现，支持状态管理）
- ✅ 前端使用 SWR 进行数据获取和缓存
- ✅ 阿里云 OSS 图片上传集成

**待实现**：
- ⏳ 订单管理 API
- ⏳ 统计数据 API
- ⏳ NextAuth.js 身份认证
- ⏳ 实时订单推送（Pusher/WebSocket）

参考文档：`docs/Next.js API路由实现方案.md`、`docs/阿里云OSS图片上传集成.md`

### 性能优化建议

- 使用 Next.js Image 组件优化图片加载
- 利用 React.Suspense 实现组件级加载状态
- 考虑使用 React Server Components 减少客户端 JavaScript
- API 路由使用 `revalidate` 配置缓存策略
- 数据库查询优化：使用 Prisma 的 `select` 和 `include` 精确获取字段
- 考虑使用 Edge Runtime 加速 API 响应
