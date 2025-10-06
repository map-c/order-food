"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const categories = ["全部", "热菜", "凉菜", "主食", "汤品", "饮料"]

const dishes = [
  {
    id: 1,
    name: "宫保鸡丁",
    category: "热菜",
    price: 38,
    image: "/kung-pao-chicken.png",
    available: true,
  },
  {
    id: 2,
    name: "麻婆豆腐",
    category: "热菜",
    price: 28,
    image: "/mapo-tofu.png",
    available: true,
  },
  {
    id: 3,
    name: "鱼香肉丝",
    category: "热菜",
    price: 32,
    image: "/yuxiang-pork.jpg",
    available: true,
  },
  {
    id: 4,
    name: "糖醋里脊",
    category: "热菜",
    price: 42,
    image: "/sweet-sour-pork.jpg",
    available: false,
  },
  {
    id: 5,
    name: "回锅肉",
    category: "热菜",
    price: 36,
    image: "/twice-cooked-pork.png",
    available: true,
  },
  {
    id: 6,
    name: "凉拌黄瓜",
    category: "凉菜",
    price: 12,
    image: "/cucumber-salad.jpg",
    available: true,
  },
  {
    id: 7,
    name: "皮蛋豆腐",
    category: "凉菜",
    price: 16,
    image: "/century-egg-tofu.jpg",
    available: true,
  },
  {
    id: 8,
    name: "米饭",
    category: "主食",
    price: 3,
    image: "/steamed-rice.png",
    available: true,
  },
  {
    id: 9,
    name: "蛋炒饭",
    category: "主食",
    price: 18,
    image: "/fried-rice.png",
    available: true,
  },
  {
    id: 10,
    name: "西红柿蛋汤",
    category: "汤品",
    price: 15,
    image: "/tomato-egg-soup.jpg",
    available: true,
  },
  {
    id: 11,
    name: "可乐",
    category: "饮料",
    price: 6,
    image: "/refreshing-cola.png",
    available: true,
  },
  {
    id: 12,
    name: "雪碧",
    category: "饮料",
    price: 6,
    image: "/sprite-drink.jpg",
    available: true,
  },
]

export function DishGrid() {
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === "全部" || dish.category === selectedCategory
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white border border-[#E0E6ED] text-[#333333] hover:border-[#1E90FF]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Dish Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <button
              key={dish.id}
              disabled={!dish.available}
              className={`relative bg-white rounded-lg p-4 text-left transition-all shadow-card hover:shadow-lg ${
                !dish.available ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            >
              {!dish.available && <Badge className="absolute top-2 right-2 bg-[#EA5455] text-white">沽清</Badge>}
              <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[#F0F2F5]">
                <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-semibold text-[#333333] mb-1 text-balance">{dish.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#1E90FF]">¥{dish.price}</span>
                {dish.available && (
                  <Button size="icon" className="h-8 w-8 rounded-full bg-[#1E90FF] hover:bg-[#1E90FF]/90">
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
