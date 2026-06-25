"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { useAdminPrefix } from "@/components/admin-context"

interface Props {
  bucket?: string
  folder?: string
  currentImage?: string
  onUpload: (url: string) => void
}

export function ImageUploader({
  bucket = "shop-assets",
  folder = "products",
  currentImage,
  onUpload,
}: Props) {
  const adminPrefix = useAdminPrefix()
  const [preview, setPreview] = useState(currentImage || "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Format d'image uniquement")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop volumineuse (max 5 Mo)")
      return
    }

    setUploading(true)
    setError("")

    const fd = new FormData()
    fd.append("file", file)
    fd.append("fileName", file.name)
    fd.append("contentType", file.type)
    fd.append("bucket", bucket)
    fd.append("folder", folder)

    try {
      const res = await fetch(`${adminPrefix}/api/upload`, {
        method: "POST",
        body: fd,
      })
      const result = await res.json()
      if (result.success) {
        setPreview(result.url)
        onUpload(result.url)
      } else {
        setError(result.error || "Erreur lors de l'upload")
      }
    } catch {
      setError("Erreur réseau")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setPreview("")
    onUpload("")
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-[#E5E5E5] group">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            sizes="160px"
          />
          <button
            onClick={removeImage}
            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          className="w-40 h-40 rounded-xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FF5722]/40 transition-colors bg-white/50"
        >
          {uploading ? (
            <div className="w-6 h-6 rounded-full border-2 border-[#FF5722]/30 border-t-[#FF5722] animate-spin" />
          ) : (
            <>
              <Upload size={20} className="text-neutral-400" />
              <span className="text-xs text-neutral-400">
                Déposer ou cliquer
              </span>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
    </div>
  )
}
