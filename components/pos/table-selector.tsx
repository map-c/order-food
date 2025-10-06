"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useTables } from "@/lib/hooks/use-tables"
import { usePOS } from "@/lib/contexts/pos-context"

const statusConfig = {
  available: { label: "空闲", color: "bg-[#28C76F]" },
  occupied: { label: "占用", color: "bg-[#EA5455]" },
  reserved: { label: "预定", color: "bg-[#FFB400]" },
  cleaning: { label: "清洁", color: "bg-[#5A6B7B]" },
  disabled: { label: "禁用", color: "bg-[#6B7280]" },
}

export function TableSelector() {
  const [searchQuery, setSearchQuery] = useState("")
  const { tables, isLoading } = useTables()
  const { selectedTableId, setSelectedTableId } = usePOS()

  const filteredTables = tables.filter((table) => table.number.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-[#333333] mb-3">选择桌台</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input
            placeholder="搜索桌号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[#6B7280] text-sm">加载中...</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <button
              onClick={() => setSelectedTableId("takeout")}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedTableId === "takeout"
                  ? "border-[#1E90FF] bg-[#1E90FF]/5"
                  : "border-[#E0E6ED] hover:border-[#1E90FF]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#333333]">外带订单</span>
                <Badge className="bg-[#5A6B7B] text-white">外带</Badge>
              </div>
            </button>

            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTableId === table.id
                    ? "border-[#1E90FF] bg-[#1E90FF]/5"
                    : "border-[#E0E6ED] hover:border-[#1E90FF]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#333333]">{table.number}</span>
                  <div
                    className={`h-2 w-2 rounded-full ${statusConfig[table.status as keyof typeof statusConfig].color}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">{table.area || "未分区"}</span>
                  <span className="text-xs text-[#6B7280]">
                    {statusConfig[table.status as keyof typeof statusConfig].label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
