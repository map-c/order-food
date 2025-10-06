"use client"

import { useState } from "react"
import { Search, Plus, Upload, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function DishFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <>
      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="搜索菜品名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="菜品分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="hot">热菜</SelectItem>
              <SelectItem value="cold">凉菜</SelectItem>
              <SelectItem value="staple">主食</SelectItem>
              <SelectItem value="soup">汤品</SelectItem>
              <SelectItem value="drink">饮料</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="available">在售</SelectItem>
              <SelectItem value="soldout">沽清</SelectItem>
              <SelectItem value="offline">下架</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" className="bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#1E90FF] hover:bg-[#1E90FF]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  添加菜品
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>添加菜品</DialogTitle>
                  <DialogDescription>填写菜品信息并保存</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">菜品名称 *</Label>
                      <Input id="name" placeholder="例如：宫保鸡丁" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">菜品分类 *</Label>
                      <Select>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hot">热菜</SelectItem>
                          <SelectItem value="cold">凉菜</SelectItem>
                          <SelectItem value="staple">主食</SelectItem>
                          <SelectItem value="soup">汤品</SelectItem>
                          <SelectItem value="drink">饮料</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">价格 (元) *</Label>
                      <Input id="price" type="number" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">成本 (元)</Label>
                      <Input id="cost" type="number" placeholder="0.00" step="0.01" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">菜品描述</Label>
                    <Textarea id="description" placeholder="简要描述菜品特色..." className="resize-none h-20" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">菜品图片</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#1E90FF] transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-[#6B7280] mb-2" />
                      <p className="text-sm text-[#6B7280]">点击上传或拖拽图片到此处</p>
                      <p className="text-xs text-[#6B7280] mt-1">支持 JPG、PNG 格式，最大 5MB</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">取消</Button>
                  <Button className="bg-[#1E90FF] hover:bg-[#1E90FF]/90">保存菜品</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </>
  )
}
