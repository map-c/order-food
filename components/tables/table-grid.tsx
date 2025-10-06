"use client"

import { useState } from "react"
import useSWR from "swr"
import { MoreVertical, Edit, Trash2, QrCode, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { QRCodeDialog } from "./qrcode-dialog"
import { useToast } from "@/hooks/use-toast"
import { fetcher } from "@/lib/api-client"

interface Table {
  id: string
  number: string
  capacity: number
  area: string | null
  status: string
  qrCode: string | null
  note: string | null
  hasOrders: boolean
  createdAt: string
  updatedAt: string
} 

type ApiResponse = Table[]


interface TableGridProps {
  onEdit: (table: Table) => void
}

export function TableGrid({ onEdit }: TableGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [qrcodeDialogOpen, setQrcodeDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { toast } = useToast()

  // 使用 SWR 获取桌台数据
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>('/api/tables', fetcher)
  const tables: Table[] = data || []

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { label: "空闲", color: "bg-gray-100 text-gray-700 border-gray-300" }
      case "occupied":
        return { label: "就餐中", color: "bg-green-100 text-green-700 border-green-300" }
      case "reserved":
        return { label: "预订", color: "bg-blue-100 text-blue-700 border-blue-300" }
      case "cleaning":
        return { label: "清理中", color: "bg-yellow-100 text-yellow-700 border-yellow-300" }
      case "disabled":
        return { label: "停用", color: "bg-red-100 text-red-700 border-red-300" }
      default:
        return { label: "未知", color: "bg-gray-100 text-gray-700 border-gray-300" }
    }
  }

  const handleDelete = (table: any) => {
    if (table.hasOrders) {
      toast({
        title: "无法删除",
        description: "该桌台有未完成的订单，无法删除",
        variant: "destructive",
      })
      return
    }
    setSelectedTable(table)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      if (!selectedTable) return
      const response = await fetch(`/api/tables/${selectedTable?.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        toast({
          title: "删除失败",
          description: result.error?.message || "删除桌台时发生错误",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "删除成功",
        description: `桌台 ${selectedTable?.number} 已删除`,
      })
      setDeleteDialogOpen(false)
      mutate() // 刷新数据
    } catch (error) {
      toast({
        title: "删除失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleShowQRCode = (table: any) => {
    setSelectedTable(table)
    setQrcodeDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">加载桌台数据失败</p>
      </div>
    )
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border">
        <p className="text-muted-foreground mb-2">暂无桌台数据</p>
        <p className="text-sm text-muted-foreground">点击右上角"新增桌台"按钮添加桌台</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const statusConfig = getStatusConfig(table.status)
          return (
            <Card key={table.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{table.number}</h3>
                  <p className="text-sm text-muted-foreground">{table.area || '未分配区域'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(table)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShowQRCode(table)}>
                      <QrCode className="h-4 w-4 mr-2" />
                      查看二维码
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(table)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  最多 {table.capacity} 人
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除桌台 {selectedTable?.number} 吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      <QRCodeDialog open={qrcodeDialogOpen} onOpenChange={setQrcodeDialogOpen} table={selectedTable} />
    </>
  )
}
