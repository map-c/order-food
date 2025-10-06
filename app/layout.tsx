import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "餐馆点餐系统 - 商家管理端",
  description: "高效的餐馆点餐与管理系统",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
