"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

export function TopNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/", label: "首页看板" },
    { href: "/pos", label: "点餐收银" },
    { href: "/orders", label: "订单管理" },
    { href: "/dishes", label: "菜品管理" },
    { href: "/tables", label: "桌台管理" },
    { href: "/reports", label: "报表中心" },
    { href: "/settings", label: "系统设置" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-14 items-center px-6">
        {/* Logo and Store Name */}
        <div className="flex items-center gap-3 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E90FF]">
            <span className="text-lg font-bold text-white">餐</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#333333]">美味餐厅</span>
            <span className="text-xs text-[#28C76F]">营业中</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === item.href ? "bg-[#1E90FF] text-white" : "text-[#333333] hover:bg-[#F0F2F5]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#EA5455]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {user?.name || '用户'}
                <div className="text-xs text-[#6B7280] font-normal mt-1">
                  {user?.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                个人信息
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[#EA5455]"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
