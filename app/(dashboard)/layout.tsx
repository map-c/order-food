import type React from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TopNav } from '@/components/layout/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <TopNav />
        <main className="p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
