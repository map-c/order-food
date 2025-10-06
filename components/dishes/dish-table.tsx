"use client"

import { useState } from "react"
import { Edit, Trash2, MoreVertical, Eye, EyeOff } from "lucide-react"
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

const dishes = [
  {
    id: 1,
    name: "宫保鸡丁",
    category: "热菜",
    price: 38,
    cost: 15,
    sales: 245,
    status: "available",
    image: "/kung-pao-chicken.png",
  },
  {
    id: 2,
    name: "麻婆豆腐",
    category: "热菜",
    price: 28,
    cost: 10,
    sales: 198,
    status: "available",
    image: "/mapo-tofu.png",
  },
  {
    id: 3,
    name: "鱼香肉丝",
    category: "热菜",
    price: 32,
    cost: 12,
    sales: 176,
    status: "available",
    image: "/yuxiang-pork.jpg",
  },
  {
    id: 4,
    name: "糖醋里脊",
    category: "热菜",
    price: 42,
    cost: 18,
    sales: 142,
    status: "soldout",
    image: "/sweet-sour-pork.jpg",
  },
  {
    id: 5,
    name: "回锅肉",
    category: "热菜",
    price: 36,
    cost: 14,
    sales: 134,
    status: "available",
    image: "/twice-cooked-pork.png",
  },
  {
    id: 6,
    name: "凉拌黄瓜",
    category: "凉菜",
    price: 12,
    cost: 4,
    sales: 89,
    status: "available",
    image: "/cucumber-salad.jpg",
  },
  {
    id: 7,
    name: "皮蛋豆腐",
    category: "凉菜",
    price: 16,
    cost: 6,
    sales: 67,
    status: "available",
    image: "/century-egg-tofu.jpg",
  },
  {
    id: 8,
    name: "米饭",
    category: "主食",
    price: 3,
    cost: 1,
    sales: 456,
    status: "available",
    image: "/steamed-rice.png",
  },
  {
    id: 9,
    name: "蛋炒饭",
    category: "主食",
    price: 18,
    cost: 7,
    sales: 123,
    status: "available",
    image: "/fried-rice.png",
  },
  {
    id: 10,
    name: "西红柿蛋汤",
    category: "汤品",
    price: 15,
    cost: 5,
    sales: 98,
    status: "offline",
    image: "/tomato-egg-soup.jpg",
  },
]

const statusConfig = {
  available: { label: "在售", color: "bg-[#28C76F] text-white" },
  soldout: { label: "沽清", color: "bg-[#FFB400] text-white" },
  offline: { label: "下架", color: "bg-[#6B7280] text-white" },
}

export function DishTable() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<(typeof dishes)[0] | null>(null)

  const handleDelete = (dish: (typeof dishes)[0]) => {
    setSelectedDish(dish)
    setDeleteDialogOpen(true)
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
              <TableHead>成本</TableHead>
              <TableHead>利润率</TableHead>
              <TableHead>销量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>显示</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dishes.map((dish) => {
              const profitMargin = ((dish.price - dish.cost) / dish.price) * 100
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
                      <span className="font-medium">{dish.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#6B7280]">{dish.category}</TableCell>
                  <TableCell className="font-semibold text-[#1E90FF]">¥{dish.price}</TableCell>
                  <TableCell className="text-[#6B7280]">¥{dish.cost}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${profitMargin >= 60 ? "text-[#28C76F]" : profitMargin >= 40 ? "text-[#FFB400]" : "text-[#EA5455]"}`}
                    >
                      {profitMargin.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-[#6B7280]">{dish.sales}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[dish.status as keyof typeof statusConfig].color}>
                      {statusConfig[dish.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch defaultChecked={dish.status !== "offline"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑菜品
                        </DropdownMenuItem>
                        {dish.status === "available" ? (
                          <DropdownMenuItem>
                            <EyeOff className="mr-2 h-4 w-4" />
                            标记沽清
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            恢复供应
                          </DropdownMenuItem>
                        )}
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
            <AlertDialogAction className="bg-[#EA5455] hover:bg-[#EA5455]/90">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
