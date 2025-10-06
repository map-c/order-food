"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDishes } from "@/lib/hooks/use-dishes"
import { useCategories } from "@/lib/hooks/use-categories"
import { usePOS } from "@/lib/contexts/pos-context"

export function DishGrid() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const { categories, isLoading: categoriesLoading } = useCategories()
  const { dishes, isLoading: dishesLoading } = useDishes({
    categoryId: selectedCategoryId,
    search: searchQuery || undefined,
    available: true,
  })
  const { addToCart } = usePOS()

  return (
    <div className="flex flex-col h-full bg-muted">
      {/* Search and Categories */}
      <div className="p-4 bg-white border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input
            placeholder="搜索菜品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategoryId === undefined
                ? "bg-[#1E90FF] text-white"
                : "bg-white border border-[#E0E6ED] text-[#333333] hover:border-[#1E90FF]"
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white border border-[#E0E6ED] text-[#333333] hover:border-[#1E90FF]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dish Grid */}
      <ScrollArea className="flex-1">
        {dishesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#6B7280]">加载中...</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#6B7280]">暂无菜品</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-3 gap-4">
            {dishes.map((dish) => {
              const isAvailable = dish.isAvailable && !dish.isSoldOut
              return (
                <div
                  key={dish.id}
                  className={`relative bg-white rounded-lg p-4 text-left transition-all shadow-card hover:shadow-lg ${
                    !isAvailable ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
                  }`}
                >
                  {!isAvailable && <Badge className="absolute top-2 right-2 bg-[#EA5455] text-white">沽清</Badge>}
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[#F0F2F5]">
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-[#333333] mb-1 text-balance">{dish.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#1E90FF]">¥{dish.price}</span>
                    {isAvailable && (
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-full bg-[#1E90FF] hover:bg-[#1E90FF]/90"
                        onClick={() =>
                          addToCart({
                            id: dish.id,
                            name: dish.name,
                            price: dish.price,
                            image: dish.image,
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
