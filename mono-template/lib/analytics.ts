import { createHash } from "crypto"
import { supabaseAdmin } from "@/lib/supabase-admin"

export type AnalyticsEventType =
  | "product_view"
  | "add_to_cart"
  | "checkout_attempt"
  | "checkout_success"
  | "category_view"
  | "promo_applied"
  | "page_view"

export interface AnalyticsMetadata {
  product_id?: string
  color_viewed?: string
  size_viewed?: string
  time_spent_estimation?: number
  category_slug?: string
  wilaya?: string
  wilaya_id?: number
  shipping_type?: "home" | "desk"
  cart_value?: number
  discount_applied?: number
  option_selections?: Record<string, string>
  quantity?: number
  unit_price?: number
  [key: string]: unknown
}

function getSessionSalt(): string {
  const salt = process.env.ANALYTICS_SESSION_SALT
  if (!salt) throw new Error("Missing ANALYTICS_SESSION_SALT environment variable")
  return salt
}

function computeSessionHash(ip: string, userAgent: string): string {
  const raw = `${getSessionSalt()}|${ip}|${userAgent}`
  return createHash("sha256").update(raw, "utf-8").digest("hex")
}

export async function trackServerEvent(
  eventType: AnalyticsEventType,
  metadata: AnalyticsMetadata = {},
  ip: string,
  userAgent: string,
): Promise<void> {
  const sessionHash = computeSessionHash(ip, userAgent)

  const { error } = await supabaseAdmin.from("analytics_events").insert({
    event_type: eventType,
    product_id: metadata.product_id ?? null,
    category_slug: metadata.category_slug ?? null,
    session_hash: sessionHash,
    metadata,
  })

  if (error) {
    console.error("Analytics insert error:", error)
  }
}

export function extractClientHeaders(
  requestHeaders: Headers,
  url?: string,
): {
  ip: string
  userAgent: string
  source: string
} {
  const forwardedFor = requestHeaders.get("x-forwarded-for")
  const ip =
    requestHeaders.get("cf-connecting-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  const userAgent = requestHeaders.get("user-agent") ?? "unknown"

  let source = "direct"

  if (url) {
    try {
      const parsedUrl = new URL(url)
      const utmSource = parsedUrl.searchParams.get("utm_source")
      if (utmSource) {
        source = utmSource
      }
    } catch {
      // ignore invalid URL
    }
  }

  if (source === "direct") {
    const referer = requestHeaders.get("referer")
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        const hostname = refererUrl.hostname
        if (
          hostname === "l.instagram.com" ||
          hostname === "instagram.com" ||
          hostname.endsWith(".instagram.com")
        ) {
          source = "instagram"
        } else if (
          hostname === "www.facebook.com" ||
          hostname === "m.facebook.com" ||
          hostname === "facebook.com" ||
          hostname.endsWith(".facebook.com")
        ) {
          source = "facebook"
        } else if (hostname === "wa.me" || hostname === "api.whatsapp.com") {
          source = "whatsapp"
        } else if (
          hostname === "vm.tiktok.com" ||
          hostname === "tiktok.com" ||
          hostname === "www.tiktok.com" ||
          hostname === "m.tiktok.com"
        ) {
          source = "tiktok"
        } else if (
          hostname === "www.google.com" ||
          hostname === "google.com" ||
          hostname.endsWith(".google.com")
        ) {
          source = "google_organic"
            } else {
          source = "referral"
        }
      } catch {
        // ignore invalid referer URL
      }
    }

    if (source === "direct" || source === "referral") {
      const referer = requestHeaders.get("referer")
      if (referer) {
        try {
          const refUrl = new URL(referer)
          const refUtm = refUrl.searchParams.get("utm_source")
          if (refUtm) source = refUtm
        } catch {}
      }
    }
  }

  return { ip, userAgent, source }
}
