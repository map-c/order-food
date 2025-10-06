"use client"

import { useState } from "react"
import { Plus, Grid3x3, List, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableGrid } from "@/components/tables/table-grid"
import { TableList } from "@/components/tables/table-list"
import { TableDialog } from "@/components/tables/table-dialog"
import { useToast } from "@/hooks/use-toast"
import { TopNav } from "@/components/layout/top-nav"

export default function TablesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<any>(null)
  const { toast } = useToast()

  const handleAddTable = () => {
    setEditingTable(null)
    setIsDialogOpen(true)
  }

  const handleEditTable = (table: any) => {
    setEditingTable(table)
    setIsDialogOpen(true)
  }

  const handleBatchQRCode = () => {
    toast({
      title: "二维码生成中",
      description: "正在为所有桌台生成二维码，请稍候...",
    })
    // 模拟生成过程
    setTimeout(() => {
      toast({
        title: "生成成功",
        description: "已为所有桌台生成二维码，可以下载打印了",
      })
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full bg-muted">
      <TopNav />
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">桌台管理</h1>
            <p className="text-sm text-muted-foreground mt-1">管理餐厅桌台信息和状态</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleBatchQRCode}>
              <Download className="h-4 w-4 mr-2" />
              批量导出二维码
            </Button>
            <Button onClick={handleAddTable}>
              <Plus className="h-4 w-4 mr-2" />
              新增桌台
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mt-4">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3x3 className="h-4 w-4 mr-2" />
            卡片视图
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4 mr-2" />
            列表视图
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === "grid" ? <TableGrid onEdit={handleEditTable} /> : <TableList onEdit={handleEditTable} />}
      </div>

      {/* Add/Edit Dialog */}
      <TableDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} table={editingTable} />
    </div>
  )
}
