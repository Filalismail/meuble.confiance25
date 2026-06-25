import type { TemporalPeak } from "@/lib/analytics-data"

interface Props {
  peak: TemporalPeak
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function PeakSvg({ peak }: Props) {
  const values = HOURS.map((h) => peak.hourlyBreakdown[String(h)] || 0)
  const maxVal = Math.max(...values, 1)
  const barWidth = 100 / 24

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-5">Heures d&apos;affluence</h2>

      <svg
        viewBox="0 0 360 120"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {values.map((val, i) => {
          const h = (val / maxVal) * 80
          const isPeak = i === peak.peakHour
          return (
            <rect
              key={i}
              x={i * (360 / 24) + 1}
              y={100 - h}
              width={360 / 24 - 2}
              height={h}
              rx={2}
              className={isPeak ? "fill-[#FF5722]" : "fill-neutral-200"}
            />
          )
        })}
        <line x1={0} y1={100} x2={360} y2={100} stroke="#E5E5E5" strokeWidth={1} />
      </svg>

      <p className="text-xs text-neutral-500 mt-2 text-center">
        Heure de pointe : <span className="font-medium text-[#FF5722]">{peak.peakHour}h</span> —{" "}
        {peak.peakHourOrders} commande{peak.peakHourOrders > 1 ? "s" : ""}
      </p>
    </div>
  )
}
