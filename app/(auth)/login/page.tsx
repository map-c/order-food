'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('登录成功')
    } catch (error: any) {
      toast.error(error.message || '登录失败，请检查邮箱和密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-md">
        {/* Logo 区域 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1E90FF]">
            <span className="text-2xl font-bold text-white">餐</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#333333]">餐馆点餐系统</span>
            <span className="text-sm text-[#6B7280]">商家管理端</span>
          </div>
        </div>

        {/* 登录卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>请输入您的账号信息登录系统</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-[#EA5455]">{errors.email.message}</p>
                )}
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-[#EA5455]">{errors.password.message}</p>
                )}
              </div>

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full bg-[#1E90FF] hover:bg-[#1E90FF]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    登录
                  </>
                )}
              </Button>
            </form>

            {/* 测试账号提示 */}
            <div className="mt-6 rounded-md bg-[#F0F2F5] p-4">
              <p className="text-xs text-[#6B7280] mb-2 font-medium">测试账号：</p>
              <div className="space-y-1 text-xs text-[#6B7280]">
                <p>邮箱：admin@example.com</p>
                <p>密码：admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <p className="text-center text-sm text-[#6B7280] mt-6">
          © 2025 餐馆点餐系统 · 专为独立餐馆打造
        </p>
      </div>
    </div>
  )
}
