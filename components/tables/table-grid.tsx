"use client"

import { useState } from "react"
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

interface TableGridProps {
  onEdit: (table: any) => void
}

export function TableGrid({ onEdit }: TableGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [qrcodeDialogOpen, setQrcodeDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const { toast } = useToast()

  // 模拟数据
  const tables = [
    { id: 1, number: "A01", area: "大厅", capacity: 4, status: "available", hasOrders: false },
    { id: 2, number: "A02", area: "大厅", capacity: 4, status: "occupied", hasOrders: true },
    { id: 3, number: "A03", area: "大厅", capacity: 6, status: "cleaning", hasOrders: false },
    { id: 4, number: "B01", area: "包间", capacity: 8, status: "available", hasOrders: false },
    { id: 5, number: "B02", area: "包间", capacity: 10, status: "occupied", hasOrders: true },
    { id: 6, number: "C01", area: "户外", capacity: 4, status: "available", hasOrders: false },
    { id: 7, number: "C02", area: "户外", capacity: 4, status: "disabled", hasOrders: false },
    { id: 8, number: "A04", area: "大厅", capacity: 2, status: "available", hasOrders: false },
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { label: "空闲", color: "bg-gray-100 text-gray-700 border-gray-300" }
      case "occupied":
        return { label: "就餐中", color: "bg-green-100 text-green-700 border-green-300" }
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

  const confirmDelete = () => {
    toast({
      title: "删除成功",
      description: `桌台 ${selectedTable?.number} 已删除`,
    })
    setDeleteDialogOpen(false)
  }

  const handleShowQRCode = (table: any) => {
    setSelectedTable(table)
    setQrcodeDialogOpen(true)
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
                  <p className="text-sm text-muted-foreground">{table.area}</p>
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
