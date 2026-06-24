import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error } = await supabaseAdmin.rpc("nightly_analytics_maintenance")

    if (error) {
      console.error("Cron aggregation RPC error:", error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Cron aggregate error:", err)
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
