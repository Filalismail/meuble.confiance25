import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  const host = request.headers.get("host") || "localhost:3000"
  const protocol = host?.includes("localhost") && process.env.NODE_ENV !== "production" ? "http" : "https"
  const origin = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  return NextResponse.redirect(new URL("/afa5e04feb3266f1", origin))
}
