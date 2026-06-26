import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_PREFIX } from "@/lib/admin-config"
import { verifyAdminSession } from "@/app/(admin)/_actions/_utils"

export async function POST() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.redirect(new URL(ADMIN_PREFIX, process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))

  const cookieStore = await cookies()
  cookieStore.delete("admin_session")

  const origin = process.env.NEXT_PUBLIC_BASE_URL
  if (!origin) {
    console.error("NEXT_PUBLIC_BASE_URL is not configured — logout redirect may fail")
    return NextResponse.redirect(new URL(ADMIN_PREFIX, "http://localhost:3000"))
  }

  return NextResponse.redirect(new URL(ADMIN_PREFIX, origin))
}
