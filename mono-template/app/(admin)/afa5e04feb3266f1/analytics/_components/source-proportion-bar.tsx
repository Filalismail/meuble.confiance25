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

function SourceDot({ source }: { source: string }) {
  const color = sourceColors[source] || "bg-[#FF5722]"
  return <span className={`block w-2 h-2 rounded-full shrink-0 ${color}`} />
}

export function SourceProportionBar({ sources }: Props) {
  const total = sources.reduce((s, r) => s + r.totalVisitors, 0)

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-6">
        Provenance des visiteurs
      </h2>

      {sources.length === 0 || total === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.5">
              <path d="M21 12a9 9 0 1 1-9-9" />
              <path d="M12 8v4l2 2" />
            </svg>
          </div>
          <p className="text-sm text-neutral-400">
            Aucune donnée de provenance pour cette période
          </p>
        </div>
      ) : (
        <>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden flex">
            {sources.map((s) => {
              const pct = (s.totalVisitors / total) * 100
              const color = sourceColors[s.source] || "bg-[#FF5722]"
              return (
                <div
                  key={s.source}
                  className={`h-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              )
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
            {sources.map((s) => {
              const pct = Math.round((s.totalVisitors / total) * 100)
              const label = sourceLabels[s.source] || s.source
              return (
                <div key={s.source} className="flex items-center gap-2 min-w-0">
                  <SourceDot source={s.source} />
                  <span className="text-xs text-neutral-500 truncate">{label}</span>
                  <span className="text-xs font-medium text-[#0A0A0A] ml-auto tabular-nums">
                    {localeSafe(s.totalVisitors)}
                  </span>
                  <span className="text-[11px] text-neutral-400 tabular-nums">
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
