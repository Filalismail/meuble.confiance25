"use client"

import { useState, useMemo } from "react"
import type { RevenueTimelineRow } from "@/lib/analytics-data"
import { localeSafe } from "@/lib/locale-safe"

interface Props {
  rows: RevenueTimelineRow[]
}

const monthsFr = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
]

const VB_W = 800
const VB_H = 250
const ML = 60
const MB = 30
const CY = 25
const CW = VB_W - ML - 10
const CH = VB_H - CY - MB
const BL = VB_H - MB
const BS = CW / 12
const BW = Math.max(BS - 8, 8)
const BG = BS - BW

function niceMax(n: number): number {
  if (n <= 0) return 10000
  const mag = Math.pow(10, Math.floor(Math.log10(n)))
  const norm = n / mag
  if (norm <= 1) return mag
  if (norm <= 2) return 2 * mag
  if (norm <= 5) return 5 * mag
  return 10 * mag
}

function fmt(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000) / 10}M`
  if (n > 0) return String(n)
  return "0"
}

export function RevenueTimeline({ rows }: Props) {
  const years = useMemo(() => {
    const ys = [...new Set(rows.map((r) => r.month.slice(0, 4)))]
    return ys.sort((a, b) => Number(b) - Number(a))
  }, [rows])

  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const activeYear = selectedYear ?? years[0] ?? String(new Date().getFullYear())

  const monthMap = useMemo(() => {
    const map = new Map<string, Map<number, { revenue: number; orderCount: number }>>()
    for (const r of rows) {
      const yr = r.month.slice(0, 4)
      const mo = Number(r.month.slice(5)) - 1
      if (!map.has(yr)) map.set(yr, new Map())
      map.get(yr)!.set(mo, { revenue: r.revenue, orderCount: r.orderCount })
    }
    return map
  }, [rows])

  const currentMonths = useMemo(() => {
    const ym = monthMap.get(activeYear)
    const out: { revenue: number; orderCount: number; label: string }[] = []
    for (let i = 0; i < 12; i++) {
      const d = ym?.get(i)
      out.push(d ? { ...d, label: monthsFr[i] } : { revenue: 0, orderCount: 0, label: monthsFr[i] })
    }
    return out
  }, [monthMap, activeYear])

  const maxRevenue = Math.max(...currentMonths.map((d) => d.revenue), 1)
  const yMax = niceMax(maxRevenue)
  const hasData = currentMonths.some((d) => d.revenue > 0)

  let peakIdx = 0
  let peakVal = 0
  for (let i = 0; i < 12; i++) {
    if (currentMonths[i].revenue > peakVal) {
      peakVal = currentMonths[i].revenue
      peakIdx = i
    }
  }

  const yLabels = [0, Math.round(yMax / 2), yMax]

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-[#0A0A0A]">Chiffre d&apos;affaires</h2>
          <p className="text-[10px] text-neutral-400" dir="rtl">الإيرادات</p>
        </div>
        {years.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100/60">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeYear === yr
                    ? "bg-[#FF5722] text-white shadow-sm"
                    : "text-neutral-500 hover:text-[#0A0A0A]"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-32 text-xs text-neutral-400">
          Aucune donnée pour cette période
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {yLabels.map((label) => {
            const y = BL - (label / yMax) * CH
            return (
              <g key={label}>
                <text
                  x={ML - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-neutral-400"
                  fontSize={12}
                >
                  {fmt(label)}
                </text>
                <line
                  x1={ML}
                  y1={y}
                  x2={VB_W - 10}
                  y2={y}
                  stroke="#E5E5E5"
                  strokeWidth={0.5}
                />
              </g>
            )
          })}

          {currentMonths.map((d, i) => {
            const barH = (d.revenue / yMax) * CH
            const x = ML + i * BS + BG / 2
            const y = BL - barH
            const isPeak = i === peakIdx
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={BW}
                  height={barH}
                  rx={2}
                  className={isPeak ? "fill-[#FF5722]" : "fill-neutral-200"}
                >
                  <title>
                    {d.label} —                     {localeSafe(d.revenue)} DA ({d.orderCount} commande
                    {d.orderCount > 1 ? "s" : ""})
                  </title>
                </rect>
                <text
                  x={x + BW / 2}
                  y={BL + 18}
                  textAnchor="middle"
                  className="fill-neutral-400"
                  fontSize={11}
                >
                  {d.label}
                </text>
              </g>
            )
          })}

          <line
            x1={ML}
            y1={BL}
            x2={VB_W - 10}
            y2={BL}
            stroke="#D4D4D4"
            strokeWidth={1}
          />
        </svg>
      )}
    </div>
  )
}
