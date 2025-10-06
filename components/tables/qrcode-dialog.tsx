"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: any
}

export function QRCodeDialog({ open, onOpenChange, table }: QRCodeDialogProps) {
  const { toast } = useToast()

  if (!table) return null

  const handleDownload = () => {
    toast({
      title: "下载成功",
      description: `桌台 ${table.number} 的二维码已下载`,
    })
  }

  const handlePrint = () => {
    toast({
      title: "打印中",
      description: `正在打印桌台 ${table.number} 的二维码...`,
    })
  }

  const handleRegenerate = () => {
    toast({
      title: "重新生成成功",
      description: `桌台 ${table.number} 的二维码已重新生成`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>桌台二维码</DialogTitle>
          <DialogDescription>
            扫描二维码即可开始点餐 - {table.number} ({table.area})
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {/* QR Code Placeholder */}
          <div className="w-64 h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="15" height="15" fill="black" />
                  <rect x="30" y="10" width="5" height="5" fill="black" />
                  <rect x="40" y="10" width="10" height="10" fill="black" />
                  <rect x="55" y="10" width="5" height="5" fill="black" />
                  <rect x="75" y="10" width="15" height="15" fill="black" />
                  <rect x="10" y="30" width="5" height="5" fill="black" />
                  <rect x="20" y="30" width="5" height="5" fill="black" />
                  <rect x="35" y="30" width="10" height="10" fill="black" />
                  <rect x="50" y="30" width="5" height="5" fill="black" />
                  <rect x="65" y="30" width="5" height="5" fill="black" />
                  <rect x="75" y="30" width="5" height="5" fill="black" />
                  <rect x="85" y="30" width="5" height="5" fill="black" />
                  <rect x="10" y="45" width="10" height="10" fill="black" />
                  <rect x="30" y="45" width="5" height="5" fill="black" />
                  <rect x="45" y="45" width="10" height="10" fill="black" />
                  <rect x="65" y="45" width="5" height="5" fill="black" />
                  <rect x="80" y="45" width="10" height="10" fill="black" />
                  <rect x="10" y="60" width="5" height="5" fill="black" />
                  <rect x="25" y="60" width="10" height="10" fill="black" />
                  <rect x="45" y="60" width="5" height="5" fill="black" />
                  <rect x="60" y="60" width="10" height="10" fill="black" />
                  <rect x="85" y="60" width="5" height="5" fill="black" />
                  <rect x="10" y="75" width="15" height="15" fill="black" />
                  <rect x="35" y="75" width="5" height="5" fill="black" />
                  <rect x="50" y="75" width="10" height="10" fill="black" />
                  <rect x="75" y="75" width="15" height="15" fill="black" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">{table.number}</p>
              <p className="text-xs text-muted-foreground">{table.area}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">顾客扫描此二维码即可查看菜单并下单</p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleRegenerate} className="w-full sm:w-auto bg-transparent">
            重新生成
          </Button>
          <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            下载
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            打印
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
