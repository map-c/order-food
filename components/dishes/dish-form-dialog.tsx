"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import type { Dish, Category } from "@/types/api"

// 表单验证 Schema
const dishFormSchema = z.object({
  name: z.string().min(1, "菜品名称不能为空"),
  categoryId: z.string().min(1, "请选择分类"),
  price: z.number().positive("价格必须大于0"),
  image: z.string().url("请提供有效的图片URL"),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  stock: z.number().int().nonnegative().optional().nullable(),
})

type DishFormValues = z.infer<typeof dishFormSchema>

interface DishFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dish?: Dish | null
  categories: Category[]
  onSuccess: () => void
}

export function DishFormDialog({
  open,
  onOpenChange,
  dish,
  categories,
  onSuccess,
}: DishFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!dish

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    clearErrors,
    setError,
  } = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      price: 0,
      image: "",
      description: "",
      isAvailable: true,
      isSoldOut: false,
      stock: null,
    },
  })

  const categoryId = watch("categoryId")
  const isAvailable = watch("isAvailable")
  const isSoldOut = watch("isSoldOut")

  // 编辑模式：加载菜品数据
  useEffect(() => {
    if (dish && open) {
      reset({
        name: dish.name,
        categoryId: dish.categoryId,
        price: dish.price,
        image: dish.image,
        description: dish.description || "",
        isAvailable: dish.isAvailable,
        isSoldOut: dish.isSoldOut,
        stock: dish.stock,
      })
    } else if (!open) {
      // 关闭对话框时重置表单
      reset({
        name: "",
        categoryId: "",
        price: 0,
        image: "",
        description: "",
        isAvailable: true,
        isSoldOut: false,
        stock: null,
      })
    }
  }, [dish, open, reset])

  const onSubmit = async (data: DishFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEdit && dish) {
        // 更新菜品
        await apiClient.patch(`/api/dishes/${dish.id}`, data)
        toast.success("菜品更新成功")
      } else {
        // 创建菜品
        await apiClient.post("/api/dishes", data)
        toast.success("菜品创建成功")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "操作失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑菜品" : "添加菜品"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改菜品信息并保存" : "填写菜品信息并保存"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* 菜品名称 & 分类 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  菜品名称 <span className="text-[#EA5455]">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例如：宫保鸡丁"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-[#EA5455]">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  菜品分类 <span className="text-[#EA5455]">*</span>
                </Label>
                <Select value={categoryId} onValueChange={(value) => setValue("categoryId", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-[#EA5455]">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* 价格 & 库存 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  价格 (元) <span className="text-[#EA5455]">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-[#EA5455]">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">库存数量（可选）</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="不限制库存"
                  {...register("stock", {
                    setValueAs: (v) => v === "" || v === null ? null : parseInt(v),
                  })}
                />
                {errors.stock && (
                  <p className="text-xs text-[#EA5455]">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* 菜品图片 */}
            <div className="space-y-2">
              <Label htmlFor="image">
                菜品图片 <span className="text-[#EA5455]">*</span>
              </Label>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => {
                      field.onChange(url)
                      clearErrors("image")
                    }}
                    onError={(error) => {
                      setError("image", {
                        type: "manual",
                        message: error,
                      })
                      toast.error(error)
                    }}
                    pathPrefix="dishes/"
                  />
                )}
              />
              {errors.image && (
                <p className="text-xs text-[#EA5455]">{errors.image.message}</p>
              )}
            </div>

            {/* 菜品描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">菜品描述</Label>
              <Textarea
                id="description"
                placeholder="简要描述菜品特色..."
                className="resize-none h-20"
                {...register("description")}
              />
            </div>

            {/* 状态开关 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>上架销售</Label>
                  <p className="text-xs text-[#6B7280]">关闭后菜品将下架，不在前台显示</p>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={(checked) => setValue("isAvailable", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>标记沽清</Label>
                  <p className="text-xs text-[#6B7280]">暂时无法供应，但仍显示在菜单上</p>
                </div>
                <Switch
                  checked={isSoldOut}
                  onCheckedChange={(checked) => setValue("isSoldOut", checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存菜品"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
