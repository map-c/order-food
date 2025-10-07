import { TopNav } from "@/components/layout/top-nav"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6">
        <div className="max-w-[1000px] mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#333333]">系统设置</h1>
            <p className="text-sm text-[#6B7280] mt-1">配置餐厅基本信息和系统参数</p>
          </div>

          {/* Restaurant Info */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">餐厅信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">餐厅名称</Label>
                <Input id="restaurant-name" defaultValue="美味餐厅" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">联系电话</Label>
                <Input id="phone" defaultValue="010-12345678" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">餐厅地址</Label>
                <Input id="address" defaultValue="北京市朝阳区某某街道123号" />
              </div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">营业时间</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="open-time">开始营业</Label>
                <Input id="open-time" type="time" defaultValue="10:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close-time">结束营业</Label>
                <Input id="close-time" type="time" defaultValue="22:00" />
              </div>
            </div>
          </Card>

          {/* System Settings */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">系统设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动打印订单</Label>
                  <p className="text-sm text-[#6B7280]">新订单自动发送到打印机</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>语音提醒</Label>
                  <p className="text-sm text-[#6B7280]">新订单时播放语音提示</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>税费计算</Label>
                  <p className="text-sm text-[#6B7280]">订单金额自动计算税费</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="tax-rate">税率 (%)</Label>
                <Input id="tax-rate" type="number" defaultValue="6" step="0.1" className="w-32" />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="bg-transparent">
              取消
            </Button>
            <Button className="bg-[#1E90FF] hover:bg-[#1E90FF]/90">保存设置</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
