import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import {
  trackServerEvent,
  extractClientHeaders,
  type AnalyticsMetadata,
} from "@/lib/analytics"
import { supabaseAdmin } from "@/lib/supabase-admin"

const TrackEventSchema = z.object({
  eventType: z.enum([
    "product_view",
    "add_to_cart",
    "checkout_attempt",
    "checkout_success",
    "category_view",
    "promo_applied",
    "page_view",
  ]),
  metadata: z.record(z.unknown()).optional(),
})

const BOT_REGEX = /bot|crawler|spider|scraper|crawl|semrush|ahrefs|seo|monitor|pingdom|facebookexternalhit|twitterbot|slurp|baiduspider|yandexbot|applebot|duckduckbot|googlebot|bingbot|adidx|adsbot/i

export async function POST(request: NextRequest) {
  try {
    const body = TrackEventSchema.parse(await request.json())

    const { eventType, metadata = {} } = body

    const requestUrl = request.nextUrl?.href || request.url
    const { ip, userAgent, source: serverSource } = extractClientHeaders(
      request.headers,
      requestUrl,
    )

    if (BOT_REGEX.test(userAgent)) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const clientSource = metadata?.source as string | undefined
    const source =
      clientSource && (serverSource === "direct" || serverSource === "referral")
        ? clientSource
        : serverSource

    const enrichedMetadata: AnalyticsMetadata = {
      ...metadata,
      source,
    }

    if (process.env.NODE_ENV !== "development") {
      const { data: rateResult } = await supabaseAdmin.rpc(
        "check_ip_rate_limit",
        {
          p_ip: ip,
          p_window_seconds: 60,
          p_max_requests: 30,
        },
      )

      if (!rateResult?.allowed) {
        return NextResponse.json(
          { ok: false, error: "Too many requests" },
          { status: 429 },
        )
      }
    }

    after(async () => {
      await trackServerEvent(eventType, enrichedMetadata, ip, userAgent)
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Track endpoint error:", e)
    return NextResponse.json({ ok: true })
  }
}
