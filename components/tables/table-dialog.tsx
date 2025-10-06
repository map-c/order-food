"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface TableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table?: any
}

export function TableDialog({ open, onOpenChange, table }: TableDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    number: "",
    area: "",
    capacity: "",
    note: "",
    enabled: true,
  })

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number || "",
        area: table.area || "",
        capacity: table.capacity?.toString() || "",
        note: table.note || "",
        enabled: table.status !== "disabled",
      })
    } else {
      setFormData({
        number: "",
        area: "",
        capacity: "",
        note: "",
        enabled: true,
      })
    }
  }, [table, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.number || !formData.area || !formData.capacity) {
      toast({
        title: "请填写必填项",
        description: "桌号、区域和容纳人数为必填项",
        variant: "destructive",
      })
      return
    }

    toast({
      title: table ? "更新成功" : "创建成功",
      description: table ? `桌台 ${formData.number} 信息已更新` : `桌台 ${formData.number} 已创建，二维码已自动生成`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{table ? "编辑桌台" : "新增桌台"}</DialogTitle>
          <DialogDescription>{table ? "修改桌台信息和状态" : "填写桌台信息，系统将自动生成二维码"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="number">
                桌号 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="number"
                placeholder="例如：A01"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="area">
                区域 <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择区域" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="大厅">大厅</SelectItem>
                  <SelectItem value="包间">包间</SelectItem>
                  <SelectItem value="户外">户外</SelectItem>
                  <SelectItem value="二楼">二楼</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">
                容纳人数 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="例如：4"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">备注</Label>
              <Textarea
                id="note"
                placeholder="例如：靠窗位置、VIP包间等"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>

            {table && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>桌台状态</Label>
                  <p className="text-sm text-muted-foreground">停用后该桌台将无法使用</p>
                </div>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{table ? "保存" : "创建"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
