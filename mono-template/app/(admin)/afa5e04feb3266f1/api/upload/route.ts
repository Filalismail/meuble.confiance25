import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
  }

  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "application/pdf"]
  if (!allowedMimes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF, PDF" }, { status: 400 })
  }

  const bucket = (formData.get("bucket") as string) || "shop-assets"
  const folder = (formData.get("folder") as string) || "products"
  const safeName = file.name.replace(/[/\\]/g, "_")
  const storagePath = `${folder}/${Date.now()}-${safeName}`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath)
  return NextResponse.json({ success: true, url: urlData.publicUrl })
}
