# Next.js API 路由实现方案

> **项目**：餐馆点餐系统
> **版本**：v1.0
> **日期**：2025-10-06
> **作者**：技术团队

---

## 📋 目录

1. [可行性分析](#可行性分析)
2. [技术架构](#技术架构)
3. [数据存储方案](#数据存储方案)
4. [API 路由设计](#api-路由设计)
5. [数据模型设计](#数据模型设计)
6. [实施步骤](#实施步骤)
7. [性能优化](#性能优化)
8. [安全考虑](#安全考虑)

---

## 可行性分析

### ✅ 为什么选择 Next.js API 路由？

#### 1. **全栈一体化开发**
- 前后端代码在同一个 Next.js 项目中
- 无需单独部署和维护后端服务器
- 开发、测试、部署流程统一

#### 2. **TypeScript 类型共享**
- API 和前端共享类型定义
- 编译时类型检查，减少运行时错误
- 更好的 IDE 智能提示

#### 3. **部署便捷性**
- Vercel 平台一键部署
- 自动处理 Serverless 函数
- 支持边缘函数（Edge Runtime）

#### 4. **适合单店规模**
- 单店系统流量可控（预计 QPS < 100）
- API Routes 性能完全满足需求
- 无需复杂的微服务架构

#### 5. **开发效率高**
- 无需处理 CORS 跨域问题
- 路径统一（`/api/*`）
- 热更新支持，开发体验好

### 📊 当前系统状态

**现状**：
- ❌ 所有数据硬编码在组件内（如 `dishes` 数组）
- ❌ 无数据持久化
- ❌ 无 API 层
- ❌ 无用户认证

**目标**：
- ✅ 建立完整的 RESTful API 层
- ✅ 实现数据持久化
- ✅ 前后端分离架构
- ✅ 添加身份认证和权限控制

---

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────┐
│         Next.js 15 App Router           │
│                                         │
│  ┌─────────────┐      ┌──────────────┐ │
│  │   前端页面   │ ◄──► │  API Routes  │ │
│  │  (React)    │      │  (/app/api)  │ │
│  └─────────────┘      └──────────────┘ │
│                              ▲          │
└──────────────────────────────┼──────────┘
                               │
                        ┌──────▼───────┐
                        │   数据库层    │
                        │  (Prisma ORM) │
                        └──────────────┘
                               │
                        ┌──────▼───────┐
                        │   Database   │
                        │ (PostgreSQL/ │
                        │   SQLite)    │
                        └──────────────┘
```

### 技术栈

| 层级 | 技术选型 | 用途 |
|------|---------|------|
| **前端** | Next.js 15 + React 19 | 页面渲染和交互 |
| **API 层** | Next.js Route Handlers | RESTful API |
| **数据验证** | Zod | Schema 验证 |
| **ORM** | Prisma | 数据库操作 |
| **数据库** | MySQL / SQLite | 数据持久化 |
| **认证** | NextAuth.js / Clerk | 用户认证 |
| **实时通信** | Pusher / Supabase Realtime | 订单实时推送 |

---

## 数据存储方案

### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **SQLite + Prisma** | • 无需额外服务<br>• 零配置<br>• 开发简单 | • 单文件存储<br>• 并发性能有限<br>• 不适合多节点部署 | 原型开发、本地部署 |
| **PostgreSQL (Vercel)** | • 关系型数据库<br>• 高性能<br>• 完整 SQL 支持<br>• 免费套餐 5GB | • 需要配置连接<br>• 有网络延迟 | 生产环境推荐 |
| **Supabase** | • 包含实时功能<br>• 内置认证<br>• 自动 RESTful API | • 学习成本<br>• 第三方依赖 | 需要实时功能的场景 |
| **PlanetScale** | • 无服务器架构<br>• 自动扩展<br>• 分支管理 | • MySQL 语法<br>• 部分功能收费 | 大规模应用 |

### 推荐方案

#### 🎯 **阶段一：开发阶段**
- **数据库**：SQLite
- **ORM**：Prisma
- **优势**：快速启动，无需额外配置

#### 🚀 **阶段二：生产部署**
- **数据库**：Vercel Postgres 或 Supabase
- **ORM**：Prisma
- **优势**：可扩展、高可用、支持备份

---

## API 路由设计

### 目录结构

```
app/api/
├── auth/                    # 认证相关
│   ├── login/route.ts      # POST 登录
│   ├── logout/route.ts     # POST 登出
│   └── register/route.ts   # POST 注册
│
├── dishes/                  # 菜品管理
│   ├── route.ts            # GET (列表), POST (创建)
│   ├── [id]/route.ts       # GET, PATCH, DELETE
│   └── categories/route.ts # GET 菜品分类
│
├── orders/                  # 订单管理
│   ├── route.ts            # GET (列表), POST (创建)
│   ├── [id]/
│   │   ├── route.ts        # GET, PATCH, DELETE
│   │   └── status/route.ts # PATCH 更新订单状态
│   └── active/route.ts     # GET 进行中的订单
│
├── tables/                  # 桌台管理
│   ├── route.ts            # GET (列表), POST (创建)
│   ├── [id]/route.ts       # GET, PATCH, DELETE
│   └── available/route.ts  # GET 空闲桌台
│
├── reports/                 # 报表数据
│   ├── daily/route.ts      # GET 日报表
│   ├── revenue/route.ts    # GET 营收统计
│   └── top-dishes/route.ts # GET 热销菜品
│
└── stats/                   # 实时统计
    └── route.ts            # GET 首页统计数据
```

### API 端点设计

#### 1. 菜品管理 (`/api/dishes`)

```typescript
// GET /api/dishes - 获取菜品列表
// Query: ?category=热菜&available=true&search=宫保
Response: {
  success: true,
  data: Dish[],
  total: number
}

// POST /api/dishes - 创建菜品
Body: {
  name: string,
  category: string,
  price: number,
  image?: string,
  description?: string
}

// GET /api/dishes/[id] - 获取单个菜品
Response: {
  success: true,
  data: Dish
}

// PATCH /api/dishes/[id] - 更新菜品
Body: Partial<Dish>

// DELETE /api/dishes/[id] - 删除菜品
Response: {
  success: true,
  message: "删除成功"
}
```

#### 2. 订单管理 (`/api/orders`)

```typescript
// GET /api/orders - 获取订单列表
// Query: ?status=pending&tableId=1&date=2025-10-06
Response: {
  success: true,
  data: Order[],
  total: number
}

// POST /api/orders - 创建订单
Body: {
  tableId: number,
  items: { dishId: number, quantity: number }[],
  note?: string
}

// PATCH /api/orders/[id]/status - 更新订单状态
Body: {
  status: "pending" | "preparing" | "completed" | "cancelled"
}
```

#### 3. 桌台管理 (`/api/tables`)

```typescript
// GET /api/tables - 获取桌台列表
Response: {
  success: true,
  data: Table[]
}

// POST /api/tables - 创建桌台
Body: {
  number: string,
  capacity: number,
  area?: string
}

// PATCH /api/tables/[id] - 更新桌台状态
Body: {
  status: "available" | "occupied" | "reserved"
}
```

#### 4. 统计数据 (`/api/stats`)

```typescript
// GET /api/stats - 获取首页统计
Response: {
  success: true,
  data: {
    todayRevenue: number,
    todayOrders: number,
    avgOrderValue: number,
    tableUtilization: number
  }
}
```

### 统一响应格式

```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string
}

// 错误响应
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

---

## 数据模型设计

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // 或 "sqlite"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

enum Role {
  OWNER   // 店主
  MANAGER // 经理
  STAFF   // 员工
}

// 菜品分类
model Category {
  id     String  @id @default(cuid())
  name   String  @unique
  dishes Dish[]
}

// 菜品模型
model Dish {
  id          String      @id @default(cuid())
  name        String
  category    Category    @relation(fields: [categoryId], references: [id])
  categoryId  String
  price       Decimal     @db.Decimal(10, 2)
  image       String?
  description String?
  available   Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
}

// 桌台模型
model Table {
  id        String      @id @default(cuid())
  number    String      @unique
  capacity  Int
  area      String?     // 区域（如：大厅、包间）
  status    TableStatus @default(AVAILABLE)
  qrCode    String?     // 二维码链接
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  orders    Order[]
}

enum TableStatus {
  AVAILABLE // 空闲
  OCCUPIED  // 占用
  RESERVED  // 预留
}

// 订单模型
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique // 订单号
  table       Table       @relation(fields: [tableId], references: [id])
  tableId     String
  user        User?       @relation(fields: [userId], references: [id])
  userId      String?
  items       OrderItem[]
  totalAmount Decimal     @db.Decimal(10, 2)
  status      OrderStatus @default(PENDING)
  note        String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum OrderStatus {
  PENDING    // 待接单
  PREPARING  // 制作中
  COMPLETED  // 已完成
  CANCELLED  // 已取消
}

// 订单项模型
model OrderItem {
  id       String  @id @default(cuid())
  order    Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId  String
  dish     Dish    @relation(fields: [dishId], references: [id])
  dishId   String
  quantity Int
  price    Decimal @db.Decimal(10, 2) // 下单时的价格
}
```

### TypeScript 类型定义

```typescript
// types/api.ts

export interface Dish {
  id: string
  name: string
  categoryId: string
  category: {
    id: string
    name: string
  }
  price: number
  image?: string
  description?: string
  available: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  tableId: string
  table: {
    number: string
  }
  items: OrderItem[]
  totalAmount: number
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED"
  note?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  dish: Dish
  quantity: number
  price: number
}

export interface Table {
  id: string
  number: string
  capacity: number
  area?: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED"
  qrCode?: string
}
```

---

## 实施步骤

### Phase 1: 数据库设置（第 1-2 天）

#### 1.1 安装依赖

```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
```

#### 1.2 初始化 Prisma

```bash
npx prisma init --datasource-provider sqlite
```

#### 1.3 定义数据模型

编辑 `prisma/schema.prisma`，添加上述模型定义。

#### 1.4 创建数据库迁移

```bash
npx prisma migrate dev --name init
```

#### 1.5 生成 Prisma Client

```bash
npx prisma generate
```

#### 1.6 创建种子数据（可选）

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建分类
  const hotDish = await prisma.category.create({
    data: { name: '热菜' }
  })

  // 创建菜品
  await prisma.dish.create({
    data: {
      name: '宫保鸡丁',
      categoryId: hotDish.id,
      price: 38,
      available: true
    }
  })

  // ... 更多种子数据
}

main()
```

### Phase 2: API 路由实现（第 3-5 天）

#### 2.1 创建 Prisma 客户端实例

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### 2.2 创建工具函数

```typescript
// lib/api-response.ts
import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message }
    },
    { status }
  )
}
```

#### 2.3 实现菜品 API

```typescript
// app/api/dishes/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

// GET /api/dishes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const available = searchParams.get('available')
    const search = searchParams.get('search')

    const dishes = await prisma.dish.findMany({
      where: {
        ...(category && { category: { name: category } }),
        ...(available && { available: available === 'true' }),
        ...(search && { name: { contains: search } })
      },
      include: {
        category: true
      }
    })

    return successResponse(dishes)
  } catch (error) {
    return errorResponse('FETCH_ERROR', '获取菜品失败', 500)
  }
}

// POST /api/dishes
const createDishSchema = z.object({
  name: z.string().min(1, '菜品名称不能为空'),
  categoryId: z.string(),
  price: z.number().positive('价格必须大于0'),
  image: z.string().optional(),
  description: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDishSchema.parse(body)

    const dish = await prisma.dish.create({
      data: validatedData,
      include: { category: true }
    })

    return successResponse(dish, '创建成功')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('VALIDATION_ERROR', error.errors[0].message)
    }
    return errorResponse('CREATE_ERROR', '创建菜品失败', 500)
  }
}
```

#### 2.4 实现其他 API 端点

按照相同模式实现：
- `app/api/dishes/[id]/route.ts` - 单个菜品操作
- `app/api/orders/route.ts` - 订单管理
- `app/api/tables/route.ts` - 桌台管理
- `app/api/stats/route.ts` - 统计数据

### Phase 3: 前端集成（第 6-8 天）

#### 3.1 创建 API 客户端

```typescript
// lib/api-client.ts
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('API request failed')
  }
  const data = await response.json()
  return data.data
}

export const api = {
  dishes: {
    getAll: (params?: URLSearchParams) =>
      fetcher<Dish[]>(`/api/dishes?${params}`),
    getById: (id: string) =>
      fetcher<Dish>(`/api/dishes/${id}`),
    create: async (data: CreateDishDto) => {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    }
  },
  // ... 其他 API
}
```

#### 3.2 使用 SWR 实现数据获取

```bash
pnpm add swr
```

```typescript
// components/pos/dish-grid.tsx
"use client"

import useSWR from 'swr'
import { fetcher } from '@/lib/api-client'
import type { Dish } from '@/types/api'

export function DishGrid() {
  const { data: dishes, error, isLoading } = useSWR<Dish[]>(
    '/api/dishes?available=true',
    fetcher
  )

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {dishes?.map(dish => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </div>
  )
}
```

#### 3.3 实现乐观更新

```typescript
import useSWR, { mutate } from 'swr'

function addToCart(dish: Dish) {
  // 乐观更新
  mutate('/api/cart', async (currentCart) => {
    const updatedCart = [...currentCart, dish]

    // 发送请求到服务器
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ dishId: dish.id })
    })

    return updatedCart
  }, false)
}
```

### Phase 4: 身份认证（第 9-10 天）

#### 4.1 安装 NextAuth.js

```bash
pnpm add next-auth @auth/prisma-adapter
```

#### 4.2 配置认证

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        return user
      }
    })
  ],
  session: {
    strategy: "jwt"
  }
})

export { handler as GET, handler as POST }
```

#### 4.3 保护 API 路由

```typescript
// lib/auth.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('未授权')
  }

  return session
}

// 在 API 路由中使用
export async function GET() {
  const session = await requireAuth()
  // ... 业务逻辑
}
```

### Phase 5: 实时功能（可选，第 11-12 天）

#### 5.1 使用 Pusher 实现订单推送

```bash
pnpm add pusher pusher-js
```

```typescript
// lib/pusher.ts
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
})

// 在订单创建时触发事件
await pusher.trigger('orders', 'new-order', order)
```

```typescript
// 前端订阅
import PusherClient from 'pusher-js'

const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
})

const channel = pusher.subscribe('orders')
channel.bind('new-order', (order: Order) => {
  // 更新 UI
  mutate('/api/orders')
})
```

---

## 性能优化

### 1. 数据库查询优化

```typescript
// 使用 Prisma 的 select 和 include
const dishes = await prisma.dish.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    // 只选择需要的字段
  },
  where: { available: true },
  take: 20, // 分页
  skip: 0,
})
```

### 2. API 响应缓存

```typescript
// app/api/dishes/route.ts
export const revalidate = 60 // 缓存 60 秒

export async function GET() {
  const dishes = await prisma.dish.findMany()
  return NextResponse.json(dishes)
}
```

### 3. 使用 Edge Runtime

```typescript
// app/api/stats/route.ts
export const runtime = 'edge'

export async function GET() {
  // 在边缘节点执行
}
```

### 4. SWR 缓存配置

```typescript
import useSWR from 'swr'

const { data } = useSWR('/api/dishes', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 60秒内去重
})
```

---

## 安全考虑

### 1. 输入验证

✅ 使用 Zod 严格验证所有输入
```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().max(99999)
})
```

### 2. SQL 注入防护

✅ Prisma 自动防止 SQL 注入（使用参数化查询）

### 3. 认证和授权

```typescript
// 基于角色的权限控制
export async function DELETE(req: NextRequest) {
  const session = await requireAuth()

  if (session.user.role !== 'OWNER') {
    return errorResponse('FORBIDDEN', '无权限', 403)
  }

  // 执行删除操作
}
```

### 4. Rate Limiting

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return errorResponse('RATE_LIMIT', '请求过于频繁', 429)
  }

  // 处理请求
}
```

### 5. CORS 配置

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' },
        ],
      },
    ]
  },
}
```

---

## 部署清单

### 环境变量配置

创建 `.env` 文件：

```bash
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Pusher（可选）
PUSHER_APP_ID="xxx"
PUSHER_KEY="xxx"
PUSHER_SECRET="xxx"
PUSHER_CLUSTER="ap1"
NEXT_PUBLIC_PUSHER_KEY="xxx"
NEXT_PUBLIC_PUSHER_CLUSTER="ap1"
```

### Vercel 部署步骤

1. 连接 GitHub 仓库
2. 配置环境变量
3. 运行数据库迁移：
   ```bash
   npx prisma migrate deploy
   ```
4. 部署应用

---

## 总结

### ✅ 优势

- 开发效率高，前后端统一技术栈
- 类型安全，减少运行时错误
- 部署简单，Serverless 架构
- 适合单店规模，成本可控

### ⚠️ 注意事项

- Serverless 函数有冷启动时间
- 数据库连接池需要优化配置
- 大文件上传需要使用对象存储（如 S3）

### 📈 后续扩展

- 添加支付功能（支付宝、微信支付）
- 实现打印机对接
- 开发移动端 H5 顾客点餐
- 集成外卖平台 API
- 添加数据分析和 BI 报表

---

## 参考资料

- [Next.js API Routes 文档](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma 文档](https://www.prisma.io/docs)
- [NextAuth.js 文档](https://next-auth.js.org)
- [SWR 文档](https://swr.vercel.app)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
