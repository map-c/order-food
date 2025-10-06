"use client"

import { useState } from "react"
import useSWR from "swr"
import { Edit, Trash2, QrCode, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface TableData {
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

interface TableListProps {
  onEdit: (table: TableData) => void
}

export function TableList({ onEdit }: TableListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [qrcodeDialogOpen, setQrcodeDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
  const { toast } = useToast()

  // 使用 SWR 获取桌台数据（fetcher 已经解包 API 响应，直接返回 TableData[]）
  const { data, error, isLoading, mutate } = useSWR<TableData[]>('/api/tables', fetcher)
  const tables = data || []

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { label: "空闲", variant: "secondary" as const }
      case "occupied":
        return { label: "就餐中", variant: "default" as const }
      case "reserved":
        return { label: "预订", variant: "outline" as const }
      case "cleaning":
        return { label: "清理中", variant: "outline" as const }
      case "disabled":
        return { label: "停用", variant: "destructive" as const }
      default:
        return { label: "未知", variant: "secondary" as const }
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
      const response = await fetch(`/api/tables/${selectedTable.id}`, {
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
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>桌号</TableHead>
              <TableHead>区域</TableHead>
              <TableHead>容纳人数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => {
              const statusConfig = getStatusConfig(table.status)
              return (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.number}</TableCell>
                  <TableCell>{table.area || '未分配区域'}</TableCell>
                  <TableCell>{table.capacity} 人</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{table.note || "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
