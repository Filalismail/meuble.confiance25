"use client"

import type { MarketingSourceRow } from "@/lib/analytics-data"
import { localeSafe } from "@/lib/locale-safe"

interface Props {
  sources: MarketingSourceRow[]
}

const sourceLabels: Record<string, string> = {
  direct: "Direct",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  google_organic: "Google",
  referral: "Référencement",
}

const sourceColors: Record<string, string> = {
  direct: "bg-neutral-400",
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
  tiktok: "bg-neutral-900",
  whatsapp: "bg-emerald-500",
  google_organic: "bg-blue-500",
}

export function SourcesBars({ sources }: Props) {
  const max = sources.length > 0 ? sources[0].totalVisitors : 1

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-5">Sources marketing</h2>
      <div className="space-y-3.5">
        {sources.map((s) => {
          const pct = Math.round((s.totalVisitors / max) * 100)
          const label = sourceLabels[s.source] || s.source
          const color = sourceColors[s.source] || "bg-[#FF5722]"
          return (
            <div key={s.source}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-600">{label}</span>
                <span className="font-medium text-[#0A0A0A]">
                  {localeSafe(s.totalVisitors)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
