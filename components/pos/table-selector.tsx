"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const tables = [
  { id: "A-01", area: "A区", status: "available" },
  { id: "A-02", area: "A区", status: "occupied" },
  { id: "A-03", area: "A区", status: "available" },
  { id: "A-04", area: "A区", status: "reserved" },
  { id: "A-05", area: "A区", status: "occupied" },
  { id: "B-01", area: "B区", status: "available" },
  { id: "B-02", area: "B区", status: "available" },
  { id: "B-03", area: "B区", status: "occupied" },
  { id: "C-01", area: "C区", status: "available" },
  { id: "C-02", area: "C区", status: "available" },
]

const statusConfig = {
  available: { label: "空闲", color: "bg-[#28C76F]" },
  occupied: { label: "占用", color: "bg-[#EA5455]" },
  reserved: { label: "预定", color: "bg-[#FFB400]" },
}

export function TableSelector() {
  const [selectedTable, setSelectedTable] = useState("A-01")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTables = tables.filter((table) => table.id.toLowerCase().includes(searchQuery.toLowerCase()))

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
        <div className="p-4 space-y-2">
          <button
            onClick={() => setSelectedTable("takeout")}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              selectedTable === "takeout"
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
              onClick={() => setSelectedTable(table.id)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedTable === table.id
                  ? "border-[#1E90FF] bg-[#1E90FF]/5"
                  : "border-[#E0E6ED] hover:border-[#1E90FF]/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[#333333]">{table.id}</span>
                <div
                  className={`h-2 w-2 rounded-full ${statusConfig[table.status as keyof typeof statusConfig].color}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">{table.area}</span>
                <span className="text-xs text-[#6B7280]">
                  {statusConfig[table.status as keyof typeof statusConfig].label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
