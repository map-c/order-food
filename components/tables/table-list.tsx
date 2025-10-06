"use client"

import { useState } from "react"
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

interface TableListProps {
  onEdit: (table: any) => void
}

export function TableList({ onEdit }: TableListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [qrcodeDialogOpen, setQrcodeDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const { toast } = useToast()

  // 模拟数据
  const tables = [
    { id: 1, number: "A01", area: "大厅", capacity: 4, status: "available", hasOrders: false, note: "" },
    { id: 2, number: "A02", area: "大厅", capacity: 4, status: "occupied", hasOrders: true, note: "靠窗位置" },
    { id: 3, number: "A03", area: "大厅", capacity: 6, status: "cleaning", hasOrders: false, note: "" },
    { id: 4, number: "B01", area: "包间", capacity: 8, status: "available", hasOrders: false, note: "VIP包间" },
    { id: 5, number: "B02", area: "包间", capacity: 10, status: "occupied", hasOrders: true, note: "豪华包间" },
    { id: 6, number: "C01", area: "户外", capacity: 4, status: "available", hasOrders: false, note: "" },
    { id: 7, number: "C02", area: "户外", capacity: 4, status: "disabled", hasOrders: false, note: "维修中" },
    { id: 8, number: "A04", area: "大厅", capacity: 2, status: "available", hasOrders: false, note: "" },
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { label: "空闲", variant: "secondary" as const }
      case "occupied":
        return { label: "就餐中", variant: "default" as const }
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
                  <TableCell>{table.area}</TableCell>
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
