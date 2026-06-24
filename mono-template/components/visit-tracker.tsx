"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

function detectSource(): string {
  const params = new URLSearchParams(window.location.search)
  const utm = params.get("utm_source")
  if (utm) return utm

  const referer = document.referrer
  if (!referer) return "direct"

  try {
    const refUrl = new URL(referer)
    const refUtm = refUrl.searchParams.get("utm_source")
    if (refUtm) return refUtm

    const h = refUrl.hostname
    if (h.includes("instagram.com") || h === "l.instagram.com") return "instagram"
    if (h.includes("facebook.com")) return "facebook"
    if (h.includes("tiktok.com") || h === "vm.tiktok.com") return "tiktok"
    if (h === "wa.me" || h === "api.whatsapp.com") return "whatsapp"
    if (h.includes("google.com")) return "google_organic"
    if (refUrl.origin !== window.location.origin) return "referral"
  } catch {}

  return "direct"
}

const trackedRef = { current: "" }

export function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (trackedRef.current === pathname) return
    trackedRef.current = pathname
    const source = detectSource()
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "page_view",
        metadata: { source },
      }),
    }).catch(() => {})
  }, [pathname])

  return null
}
