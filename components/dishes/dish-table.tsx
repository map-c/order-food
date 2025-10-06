"use client"

import { useState } from "react"
import useSWR from "swr"
import { Edit, Trash2, MoreVertical, Eye, EyeOff, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
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
import { toast } from "sonner"
import { fetcher, apiClient } from "@/lib/api-client"
import type { Dish, Category } from "@/types/api"
import { DishFormDialog } from "./dish-form-dialog"

interface DishTableProps {
  categoryFilter: string
  searchQuery: string
  statusFilter: string
}

export function DishTable({ categoryFilter, searchQuery, statusFilter }: DishTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 构建查询参数
  const params = new URLSearchParams()
  if (categoryFilter && categoryFilter !== 'all') {
    params.append('categoryId', categoryFilter)
  }
  if (searchQuery) {
    params.append('search', searchQuery)
  }
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'available') {
      params.append('isAvailable', 'true')
      params.append('isSoldOut', 'false')
    } else if (statusFilter === 'soldout') {
      params.append('isSoldOut', 'true')
    } else if (statusFilter === 'offline') {
      params.append('isAvailable', 'false')
    }
  }

  const queryString = params.toString()
  const apiUrl = queryString ? `/api/dishes?${queryString}` : '/api/dishes'

  // 获取菜品列表
  const { data: dishes, error, isLoading, mutate } = useSWR<Dish[]>(
    apiUrl,
    fetcher
  )

  // 获取分类列表（用于编辑对话框）
  const { data: categories = [] } = useSWR<Category[]>('/api/categories', fetcher)

  const handleEdit = (dish: Dish) => {
    setSelectedDish(dish)
    setEditDialogOpen(true)
  }

  const handleDelete = (dish: Dish) => {
    setSelectedDish(dish)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedDish) return

    setDeletingId(selectedDish.id)
    try {
      await apiClient.delete(`/api/dishes/${selectedDish.id}`)
      toast.success('菜品删除成功')
      mutate() // 重新获取数据
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || '删除失败')
      // 删除失败时不关闭对话框，让用户看到错误提示
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSoldOut = async (dish: Dish) => {
    try {
      await apiClient.patch(`/api/dishes/${dish.id}`, {
        isSoldOut: !dish.isSoldOut,
      })
      toast.success(dish.isSoldOut ? '已恢复供应' : '已标记沽清')
      mutate() // 重新获取数据
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const toggleAvailability = async (dish: Dish, checked: boolean) => {
    try {
      await apiClient.patch(`/api/dishes/${dish.id}`, {
        isAvailable: checked,
      })
      toast.success(checked ? '菜品已上架' : '菜品已下架')
      mutate() // 重新获取数据
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  if (error) {
    return (
      <Card className="shadow-card p-8 text-center">
        <p className="text-[#EA5455]">加载失败: {error.message}</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="shadow-card p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#1E90FF]" />
        <p className="text-[#6B7280] mt-2">加载中...</p>
      </Card>
    )
  }

  if (!dishes || dishes.length === 0) {
    return (
      <Card className="shadow-card p-8 text-center">
        <p className="text-[#6B7280]">暂无菜品数据</p>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>菜品</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>显示</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dishes.map((dish) => {
              const status = dish.isSoldOut ? 'soldout' : dish.isAvailable ? 'available' : 'offline'
              const statusConfig = {
                available: { label: "在售", color: "bg-[#28C76F] text-white" },
                soldout: { label: "沽清", color: "bg-[#FFB400] text-white" },
                offline: { label: "下架", color: "bg-[#6B7280] text-white" },
              }

              return (
                <TableRow key={dish.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#F0F2F5] flex-shrink-0">
                        <img
                          src={dish.image || "/placeholder.svg"}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{dish.name}</span>
                        {dish.description && (
                          <span className="text-xs text-[#6B7280]">{dish.description}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#6B7280]">{dish.category.name}</TableCell>
                  <TableCell className="font-semibold text-[#1E90FF]">¥{dish.price}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[status].color}>
                      {statusConfig[status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={dish.isAvailable}
                      onCheckedChange={(checked) => toggleAvailability(dish, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(dish)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑菜品
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSoldOut(dish)}>
                          {dish.isSoldOut ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              恢复供应
                            </>
                          ) : (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              标记沽清
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-[#EA5455]" onClick={() => handleDelete(dish)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除菜品
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dish Dialog */}
      <DishFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        dish={selectedDish}
        categories={categories}
        onSuccess={() => mutate()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除菜品</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除「{selectedDish?.name}」吗？此操作无法撤销，菜品的所有数据将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA5455] hover:bg-[#EA5455]/90"
              onClick={confirmDelete}
              disabled={!!deletingId}
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
