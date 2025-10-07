# Vercel 部署问题与解决方案

本文档记录了餐馆点餐系统部署到 Vercel 时遇到的问题及解决方案。

## 问题 1：Prisma Client 未生成

### 错误信息

```
./node_modules/.pnpm/@prisma+client@6.16.3/node_modules/@prisma/client/index-browser.js
Module not found: Can't resolve '.prisma/client/index-browser'

Import trace for requested module:
./lib/prisma.ts
./lib/report-utils.ts
./components/reports/report-stats.tsx
```

### 原因分析

1. Vercel 在构建时执行 `pnpm install` 和 `pnpm build`
2. 默认情况下，`pnpm install` 不会自动生成 Prisma Client
3. 构建过程中找不到 `.prisma/client` 模块导致失败

### 解决方案

在 [package.json](../package.json) 中添加 `postinstall` 脚本：

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "next build",
    "dev": "next dev"
  }
}
```

**工作原理**：
- `pnpm install` 完成后会自动执行 `postinstall` 钩子
- `prisma generate` 生成 Prisma Client 到 `node_modules/.prisma/client`
- 随后的 `pnpm build` 可以正常找到 Prisma Client

---

## 问题 2：数据库依赖配置不当

### 错误症状

虽然添加了 `postinstall` 脚本，但 `prisma` 包在 `dependencies` 中，导致生产环境包体积增大。

### 最佳实践

将 Prisma CLI 移至 `devDependencies`：

```json
{
  "dependencies": {
    "@prisma/client": "^6.16.3"  // 运行时需要
  },
  "devDependencies": {
    "prisma": "^6.16.3"          // 仅构建时需要
  }
}
```

**说明**：
- `@prisma/client`：运行时使用的客户端库（保留在 dependencies）
- `prisma`：CLI 工具，仅在构建和开发时使用（移至 devDependencies）

---

## 问题 3：SQLite 在 Vercel 上的限制

### 问题描述

项目初期使用 SQLite (`file:./dev.db`)，但 Vercel 是 Serverless 架构：

- **无状态文件系统**：每次函数调用可能在不同容器中执行
- **只读部署**：构建时的文件部署后为只读，无法执行写操作
- **数据丢失**：`/tmp` 目录可写但不持久化

### 解决方案

切换到云数据库（PostgreSQL）：

#### 方案 1：Vercel Postgres（推荐）

**优势**：
- 与 Vercel 深度集成，一键添加
- 自动注入环境变量
- 自动配置连接池

**步骤**：
1. Vercel Dashboard → Storage → Create Database → Postgres
2. 选择区域（如 Hong Kong）
3. 自动注入环境变量：
   ```bash
   POSTGRES_URL
   POSTGRES_PRISMA_URL  # 推荐用于 Prisma
   POSTGRES_URL_NON_POOLING
   ```

#### 方案 2：Neon（更大免费额度）

**优势**：
- 免费额度 3 GB（Vercel Postgres 仅 256 MB）
- Serverless Postgres，自动休眠闲置数据库
- 支持分支和时间旅行

**步骤**：
1. 注册 [neon.tech](https://neon.tech)
2. 创建项目，选择区域（如 Singapore）
3. 复制连接字符串
4. 在 Vercel 添加环境变量 `DATABASE_URL`

---

## 问题 4：数据库切换后的迁移错误

### 错误信息

```
Error: P3019

The datasource provider `postgresql` specified in your schema
does not match the one specified in the migration_lock.toml, `sqlite`.
```

### 原因

Prisma 迁移历史记录了之前使用的数据库类型（SQLite），与新的 PostgreSQL 冲突。

### 解决方案

#### 步骤 1：修改 Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // 从 sqlite 改为 postgresql
  url      = env("DATABASE_URL")
}
```

#### 步骤 2：删除旧迁移历史

```bash
rm -rf prisma/migrations
```

#### 步骤 3：重新生成 Prisma Client

```bash
npx prisma generate
```

#### 步骤 4：创建新的迁移

```bash
pnpm db:migrate
# 或
npx prisma migrate dev --name init_postgresql
```

#### 步骤 5：填充种子数据

```bash
pnpm db:seed
```

---

## 问题 5：本地开发后的客户端未更新

### 错误信息

```
Module not found: Can't resolve '.prisma/client/index-browser'
```

### 原因

本地修改了 `schema.prisma` 或 `DATABASE_URL` 后，未重新生成 Prisma Client。

### 解决方案

每次修改 `schema.prisma` 后执行：

```bash
npx prisma generate
```

**自动化方案**：
在 `package.json` 中配置 `postinstall`（如问题 1 所述），确保依赖安装后自动生成。

---

## 完整部署检查清单

### 1. 数据库准备

- [ ] 选择云数据库方案（Vercel Postgres / Neon / Supabase）
- [ ] 获取数据库连接字符串
- [ ] 修改 `prisma/schema.prisma` 的 `provider` 为 `postgresql`

### 2. 代码配置

- [ ] 添加 `postinstall` 脚本到 `package.json`
- [ ] 确认 `prisma` 在 `devDependencies`
- [ ] 确认 `@prisma/client` 在 `dependencies`

### 3. 本地测试

```bash
# 删除旧迁移（如果切换数据库类型）
rm -rf prisma/migrations

# 重新生成客户端
npx prisma generate

# 创建迁移
pnpm db:migrate

# 填充种子数据
pnpm db:seed

# 测试构建
pnpm build
```

### 4. Vercel 配置

- [ ] 在 Vercel Dashboard 配置环境变量：
  - `DATABASE_URL` 或 `POSTGRES_PRISMA_URL`
  - `JWT_SECRET`（生产环境强密钥，至少 32 字符）
  - `JWT_EXPIRES_IN`
  - `REFRESH_TOKEN_EXPIRES_IN`
  - `ALIYUN_OSS_ACCESS_KEY_ID`
  - `ALIYUN_OSS_ACCESS_KEY_SECRET`
  - `ALIYUN_OSS_REGION`
  - `ALIYUN_OSS_BUCKET`
  - `ALIYUN_OSS_ENDPOINT`
  - `ALIYUN_OSS_RAM_ROLE_ARN`
  - `ALIBABA_CLOUD_STS_ROLE_SESSION_NAME`

### 5. 部署

```bash
# 提交代码
git add .
git commit -m "chore: 配置 Vercel 部署"
git push origin main
```

Vercel 会自动触发部署，或在 Dashboard 手动触发。

### 6. 部署后操作

如果需要运行迁移或种子数据：

```bash
# 拉取 Vercel 环境变量
vercel env pull .env.production.local

# 运行迁移（连接生产数据库）
pnpm db:migrate

# 填充种子数据（可选）
pnpm db:seed
```

---

## 常见问题排查

### 构建失败：找不到 Prisma Client

**检查**：
1. `package.json` 中是否有 `"postinstall": "prisma generate"`
2. Vercel 构建日志中是否显示执行了 `prisma generate`

**解决**：
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 运行时数据库连接失败

**检查**：
1. Vercel → Settings → Environment Variables 是否配置了 `DATABASE_URL`
2. 数据库连接字符串是否包含 `?sslmode=require`（PostgreSQL）
3. 数据库是否允许来自 Vercel 的连接（检查防火墙规则）

**解决**：
- Vercel Postgres：自动配置，无需手动设置
- Neon：确保使用 pooled connection string
- 其他数据库：添加 Vercel IP 地址到白名单

### 数据库迁移未应用

**症状**：
部署成功，但访问时报表不存在等错误。

**原因**：
Vercel 不会自动运行数据库迁移。

**解决**：
```bash
# 本地连接生产数据库执行迁移
vercel env pull .env.production.local
pnpm db:migrate
```

或在 `package.json` 中添加构建时迁移（不推荐，可能导致冲突）：
```json
{
  "scripts": {
    "build": "prisma migrate deploy && next build"
  }
}
```

---

## 参考链接

- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Neon 文档](https://neon.tech/docs)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Vercel 部署文档](https://nextjs.org/docs/deployment)

---

## 更新日志

- **2025-10-07**：初始版本，记录 Prisma Client 生成和数据库切换问题
