# IDE TypeScript 问题解决方案

## 问题：找不到模块 "swr" 或其相应的类型声明

### 症状
- IDE (VSCode/Cursor) 显示红色波浪线
- 错误信息：`找不到模块"swr"或其相应的类型声明`
- 但实际上 `pnpm list swr` 显示已安装
- `pnpm build` 和 `pnpm dev` 都能正常工作

### 原因
这是 IDE 的 TypeScript 语言服务器缓存问题，不是代码问题。

### 解决方案

#### 方案 1：重启 TypeScript 服务器（推荐）

**VSCode**:
1. 按 `Cmd + Shift + P` (Mac) 或 `Ctrl + Shift + P` (Windows/Linux)
2. 输入 `TypeScript: Restart TS Server`
3. 回车

**Cursor**:
1. 按 `Cmd + Shift + P` (Mac) 或 `Ctrl + Shift + P` (Windows/Linux)
2. 输入 `TypeScript: Restart TS Server`
3. 回车

#### 方案 2：重新安装依赖

```bash
# 删除 node_modules 和 lockfile
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

#### 方案 3：清理 IDE 缓存

**VSCode**:
```bash
# 关闭 VSCode
# 删除缓存
rm -rf ~/Library/Caches/com.microsoft.VSCode
# 重新打开 VSCode
```

**Cursor**:
```bash
# 关闭 Cursor
# 删除缓存
rm -rf ~/Library/Caches/com.cursor.*
# 重新打开 Cursor
```

#### 方案 4：重新加载窗口

**VSCode/Cursor**:
1. 按 `Cmd + Shift + P` (Mac) 或 `Ctrl + Shift + P` (Windows/Linux)
2. 输入 `Developer: Reload Window`
3. 回车

#### 方案 5：检查 TypeScript 版本

```bash
# 查看项目 TypeScript 版本
pnpm list typescript

# 查看 VSCode 使用的 TypeScript 版本
# 在 VSCode 中：底部状态栏点击 "TypeScript" 版本号
# 选择 "Use Workspace Version"
```

### 验证修复

1. 打开 `lib/hooks/use-reports.ts`
2. 检查 `import useSWR from 'swr'` 是否还有红色波浪线
3. 如果没有，说明问题已解决

### 预防措施

#### 1. 使用 VSCode 工作区版本的 TypeScript

在 `.vscode/settings.json` 中添加：

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

#### 2. 配置 TypeScript 路径别名

确保 `tsconfig.json` 正确配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### 3. 定期清理缓存

添加 npm script：

```json
{
  "scripts": {
    "clean": "rm -rf .next node_modules/.cache"
  }
}
```

### 常见问题

#### Q1: 为什么其他项目没有这个问题？

A: 可能的原因：
- 使用的包管理器不同（npm vs pnpm vs yarn）
- TypeScript 版本不同
- IDE 扩展冲突

#### Q2: 是否需要修改代码？

A: **不需要**。这是 IDE 缓存问题，代码本身没有问题。`pnpm build` 和 `pnpm dev` 都能正常工作证明了这一点。

#### Q3: 为什么 pnpm 容易出现这个问题？

A: pnpm 使用符号链接（symlink）节省磁盘空间，IDE 的 TypeScript 服务器有时无法正确解析符号链接。这不是 pnpm 的问题，而是 IDE 的限制。

### 相关链接

- [VSCode TypeScript 文档](https://code.visualstudio.com/docs/languages/typescript)
- [pnpm 常见问题](https://pnpm.io/faq)
- [Next.js TypeScript 配置](https://nextjs.org/docs/basic-features/typescript)

## 其他常见 IDE TypeScript 问题

### 问题：路径别名 `@/` 无法识别

**症状**: `import { xxx } from '@/lib/xxx'` 显示错误

**解决方案**:
1. 确认 `tsconfig.json` 中配置了 `paths`
2. 重启 TypeScript 服务器
3. 检查 `.next/types` 目录是否存在

### 问题：React 19 类型不兼容

**症状**: `Property 'children' does not exist on type...`

**解决方案**:
```bash
# 确保使用正确的 React 类型
pnpm add -D @types/react@19 @types/react-dom@19
```

### 问题：Prisma Client 类型找不到

**症状**: `Cannot find module '.prisma/client'`

**解决方案**:
```bash
# 重新生成 Prisma Client
npx prisma generate

# 重启 TypeScript 服务器
```

---

## 更新日志

- **2025-10-07**: 创建文档，记录 SWR 模块找不到的解决方案
