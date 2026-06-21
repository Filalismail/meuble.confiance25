import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import {
  trackServerEvent,
  extractClientHeaders,
  type AnalyticsEventType,
  type AnalyticsMetadata,
} from "@/lib/analytics"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      eventType: AnalyticsEventType
      metadata?: AnalyticsMetadata
    }

    const { eventType, metadata = {} } = body

    if (!eventType) {
      return NextResponse.json({ ok: true })
    }

    const requestUrl = request.nextUrl?.href || request.url
    const { ip, userAgent, source } = extractClientHeaders(
      request.headers,
      requestUrl,
    )

    const enrichedMetadata: AnalyticsMetadata = {
      ...metadata,
      source,
    }

    after(async () => {
      await trackServerEvent(eventType, enrichedMetadata, ip, userAgent)
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
