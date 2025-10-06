"use client"

import { useState, useRef, DragEvent } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadToOSS, validateImageFile } from "@/lib/oss-client"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  pathPrefix?: string
}

export function ImageUpload({ value, onChange, onError, pathPrefix = "dishes/" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    // 验证文件
    const validation = validateImageFile(file)
    if (!validation.valid) {
      onError?.(validation.error || "文件验证失败")
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      // 上传到 OSS
      const result = await uploadToOSS({
        file,
        pathPrefix,
        onProgress: (percent) => {
          setProgress(percent)
        },
      })

      if (!result.success || !result.url) {
        throw new Error(result.error || "上传失败")
      }

      setPreviewUrl(result.url)
      onChange(result.url)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "上传失败"
      onError?.(errorMessage)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file)
    }
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={`
          relative border-2 border-dashed rounded-lg overflow-hidden
          transition-all duration-200 cursor-pointer
          ${dragOver ? "border-[#1E90FF] bg-blue-50" : "border-[#E0E6ED] hover:border-[#1E90FF]"}
          ${uploading ? "pointer-events-none" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          <div className="relative w-full h-64 group">
            <Image
              src={previewUrl}
              alt="预览图"
              fill
              className="object-cover"
              unoptimized
            />
            {!uploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  onClick={handleRemove}
                  variant="destructive"
                  size="sm"
                  className="bg-[#EA5455] hover:bg-[#EA5455]/90"
                >
                  <X className="h-4 w-4 mr-2" />
                  删除图片
                </Button>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 p-6">
                <div className="text-center text-white">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <div className="text-lg font-medium mb-2">上传中...</div>
                  <div className="text-3xl font-bold">{progress}%</div>
                </div>
                <Progress value={progress} className="w-full max-w-xs bg-white/20" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-[#6B7280] p-6">
            {uploading ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#1E90FF]" />
                <div className="text-lg font-medium text-[#333333] mb-2">上传中...</div>
                <div className="text-2xl font-bold text-[#1E90FF] mb-4">{progress}%</div>
                <Progress value={progress} className="w-64 mx-auto" />
              </div>
            ) : (
              <>
                <Upload className="h-16 w-16 mb-4 text-[#6B7280]" />
                <p className="text-lg font-medium mb-2 text-[#333333]">点击上传或拖拽图片到此处</p>
                <p className="text-sm text-[#6B7280]">支持 JPG、PNG、WebP、GIF 格式，大小不超过 5MB</p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl && !uploading && (
        <p className="text-xs text-[#6B7280]">点击图片可重新上传</p>
      )}
    </div>
  )
}
