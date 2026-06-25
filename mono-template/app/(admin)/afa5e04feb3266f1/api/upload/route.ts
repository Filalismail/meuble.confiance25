import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "application/pdf"]
const ALLOWED_BUCKETS = ["shop-assets"]
const ALLOWED_FOLDERS = ["products", "categories", "logos", "content"]

const MAGIC_BYTES: Record<string, string[]> = {
  "image/jpeg": ["ffd8ffe0", "ffd8ffe1", "ffd8ffe2"],
  "image/png": ["89504e47"],
  "image/webp": ["52494646"],
  "image/gif": ["47494638"],
  "image/avif": ["0000001c66747970"],
  "application/pdf": ["25504446"],
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  if (file.size === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
  }

  if (!ALLOWED_MIMES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }

  const header = Buffer.from(await file.arrayBuffer()).slice(0, 8).toString("hex")
  const validHeaders = MAGIC_BYTES[file.type]
  if (!validHeaders || !validHeaders.some((h) => header.startsWith(h))) {
    return NextResponse.json({ error: "File content does not match declared type" }, { status: 400 })
  }

  const bucket = (formData.get("bucket") as string) || "shop-assets"
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 })
  }

  const folder = (formData.get("folder") as string) || "products"
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 })
  }

  const safeName = file.name.replace(/[/\\]/g, "_").replace(/\.\./g, "")
  const storagePath = `${folder}/${Date.now()}-${safeName}`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath)
  return NextResponse.json({ success: true, url: urlData.publicUrl })
}
