# TypeScript 类型错误修复清单

本文档记录应用中存在的 TypeScript 类型错误及修复进度。

## 修复进度

- ✅ 已修复：3 个
- ⏳ 进行中：0 个
- ❌ 待修复：28 个

---

## 已修复的问题 ✅

### 1. Login API - User.role 类型错误
**文件**: `app/api/auth/login/route.ts:68`

**问题**:
```typescript
// Prisma 返回的 role 是 string 类型
user: userWithoutPassword  // ❌ role: string 不匹配 'owner' | 'manager' | 'staff'
```

**解决方案**:
```typescript
user: {
  ...userWithoutPassword,
  role: userWithoutPassword.role as 'owner' | 'manager' | 'staff',
}
```

### 2. CategoryChart - percent 参数类型
**文件**: `components/reports/category-chart.tsx:28`

**问题**:
```typescript
label={({ name, percent }) => ...}  // ❌ percent 类型未知
```

**解决方案**:
```typescript
label={({ name, percent }: { name: string; percent: number }) => ...}
```

### 3. ReportStats - stat.change 可能未定义
**文件**: `components/reports/report-stats.tsx:84`

**问题**:
```typescript
{stat.change.toFixed(1)}  // ❌ change 可能是 undefined
```

**解决方案**:
```typescript
{hasChange && stat.change !== undefined && (
  <div>
    {stat.change.toFixed(1)}%
  </div>
)}
```

---

## 待修复的问题 ❌

### API 路由 (6 个)

#### 1. dishes/route.ts:44
```typescript
const where: any = {}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { Prisma } from '@prisma/client'
const where: Prisma.DishWhereInput = {}
```

#### 2. orders/route.ts:47
```typescript
const where: any = {}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { Prisma } from '@prisma/client'
const where: Prisma.OrderWhereInput = {}
```

#### 3. tables/route.ts:24
```typescript
const where: any = {}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { Prisma } from '@prisma/client'
const where: Prisma.TableWhereInput = {}
```

#### 4. reports/dishes/route.ts:112
```typescript
dishStats.map((stat: any) => ...)  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
interface DishStatResult {
  dishId: string
  _sum: {
    quantity: number | null
    subtotal: number | null
  }
}
dishStats.map((stat: DishStatResult) => ...)
```

### 组件 - any 类型 (15 个)

#### 5-8. DishTable 组件
**文件**: `components/dishes/dish-table.tsx:95,110,122`

```typescript
onClick={(e: any) => ...}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { MouseEvent } from 'react'
onClick={(e: MouseEvent<HTMLButtonElement>) => ...}
```

#### 9-11. OrderList 组件
**文件**: `components/orders/order-list.tsx:203,227,245`

```typescript
onClick={(e: any) => ...}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { MouseEvent } from 'react'
onClick={(e: MouseEvent<HTMLButtonElement>) => ...}
```

#### 12-15. Tables 组件
**文件**: `components/tables/table-grid.tsx:71,117`
**文件**: `components/tables/table-list.tsx:68,114`

```typescript
onClick={(e: any) => ...}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { MouseEvent } from 'react'
onClick={(e: MouseEvent<HTMLButtonElement>) => ...}
```

#### 16. QRCodeDialog
**文件**: `components/tables/qrcode-dialog.tsx:18`

```typescript
setQrDataUrl((url: any) => ...)  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
setQrDataUrl((url: string) => ...)
```

#### 17. TableDialog
**文件**: `components/tables/table-dialog.tsx:88`

```typescript
setError((error: any) => ...)  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
setError((error: string) => ...)
```

#### 18. DishFormDialog
**文件**: `components/dishes/dish-form-dialog.tsx:135`

```typescript
catch (error: any)  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
catch (error: unknown) {
  const message = error instanceof Error ? error.message : '未知错误'
}
```

#### 19. LoginPage
**文件**: `app/(auth)/login/page.tsx:39`

```typescript
catch (error: any)  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
catch (error: unknown) {
  const message = error instanceof Error ? error.message : '登录失败'
}
```

#### 20. TablesPage
**文件**: `app/(dashboard)/tables/page.tsx:15,23`

```typescript
onClick={(e: any) => ...}  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
import { MouseEvent } from 'react'
onClick={(e: MouseEvent<HTMLButtonElement>) => ...}
```

### lib 工具函数 (3 个)

#### 21-23. api-client.ts
**文件**: `lib/api-client.ts:47,56,105`

```typescript
const error: any = new Error(...)  // ❌ 使用 any 类型
```

**修复方案**:
```typescript
interface ApiError extends Error {
  status?: number
  code?: string
  info?: unknown
}

const error = new Error(...) as ApiError
error.status = res.status
```

### UI 组件 - Chart.tsx (7 个)

#### 24-30. chart.tsx
**文件**: `components/ui/chart.tsx`

这是 shadcn/ui 的 chart 组件，类型错误较复杂：

```typescript
// 错误 1: payload 属性不存在
props.payload  // ❌

// 错误 2: label 属性不存在
props.label  // ❌

// 错误 3: item 参数隐式 any
.map((item, index) => ...)  // ❌

// 错误 4: 泛型约束不满足
Omit<TooltipProps, "payload" | "verticalAlign">  // ❌
```

**修复方案**:
这个文件是从 shadcn/ui 生成的，建议：
1. 重新从最新版本的 shadcn/ui 生成
2. 或添加类型忽略注释：`// @ts-expect-error - shadcn chart component`

---

## 警告 (Warnings) - 可选修复

### 未使用的变量

1. `app/api/auth/login/route.ts:65` - `_` 变量未使用（密码解构）
   - **建议**: 保持现状，`_` 是约定的忽略变量

2. `app/api/categories/route.ts:9` - `request` 参数未使用
   - **修复**: 改为 `_request` 或移除参数

3. `app/api/dashboard/route.ts:5` - `format` 导入未使用
   - **修复**: 移除导入

4. `components/pos/dish-grid.tsx:17` - `categoriesLoading` 未使用
   - **修复**: 移除或使用该变量

5. `components/pos/order-cart.tsx:46` - `totalQuantity` 未使用
   - **修复**: 移除或使用该变量

### React Hooks 依赖

6. `components/orders/order-list.tsx:127` - `useMemo` 依赖问题
   - **修复**: 包装 `orders` 在自己的 `useMemo` 中

### 图片优化

7. `components/dishes/dish-table.tsx:180` - 使用 `<img>` 而非 `<Image>`
8. `components/pos/dish-grid.tsx:89` - 使用 `<img>` 而非 `<Image>`
   - **修复**: 使用 Next.js `Image` 组件

### React 转义字符

9. `components/tables/table-grid.tsx:142` - 未转义的引号
10. `components/tables/table-list.tsx:139` - 未转义的引号
   - **修复**: 使用 `&quot;` 或 `&ldquo;`/`&rdquo;`

---

## 修复优先级

### P0 - 高优先级（影响类型安全）

- [ ] API 路由的 `any` 类型（dishes, orders, tables）
- [ ] lib/api-client.ts 的错误类型定义
- [ ] 组件事件处理器的 `any` 类型

### P1 - 中优先级（代码质量）

- [ ] 未使用的变量和导入
- [ ] React Hooks 依赖警告

### P2 - 低优先级（最佳实践）

- [ ] 图片组件优化
- [ ] React 转义字符
- [ ] chart.tsx 组件类型（shadcn/ui 问题）

---

## 批量修复脚本

### 修复事件处理器 any 类型

```bash
# 在文件顶部添加 React 导入
import { MouseEvent } from 'react'

# 替换 onClick 的 any 类型
sed -i '' 's/onClick={(e: any)/onClick={(e: MouseEvent<HTMLButtonElement>)/g' components/**/*.tsx
```

### 修复 API 路由 where 条件

```typescript
// 在每个 API 路由文件顶部添加
import { Prisma } from '@prisma/client'

// 替换 where: any
// dishes:
const where: Prisma.DishWhereInput = {}

// orders:
const where: Prisma.OrderWhereInput = {}

// tables:
const where: Prisma.TableWhereInput = {}
```

---

## 更新日志

- **2025-10-07**: 创建文档，修复 3 个类型错误，记录 28 个待修复问题
