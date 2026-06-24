"use client"

import type { TemporalPeak } from "@/lib/analytics-data"

interface Props {
  peak: TemporalPeak
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const VIEW_BOX_W = 800
const VIEW_BOX_H = 250
const MARGIN_LEFT = 50
const MARGIN_BOTTOM = 30
const CHART_X = MARGIN_LEFT
const CHART_Y_TOP = 25
const CHART_W = VIEW_BOX_W - MARGIN_LEFT - 10
const CHART_H = VIEW_BOX_H - CHART_Y_TOP - MARGIN_BOTTOM
const BASELINE = VIEW_BOX_H - MARGIN_BOTTOM
const BAR_SLOT = CHART_W / 24
const BAR_W = Math.max(BAR_SLOT - 4, 6)
const BAR_GAP = BAR_SLOT - BAR_W

export function PeakChart({ peak }: Props) {
  const values = HOURS.map((h) => peak.hourlyBreakdown[String(h)] || 0)
  const maxVal = Math.max(...values, 1)
  const yMax = Math.ceil(maxVal / 5) * 5 || 5

  const yLabelPositions = [0, Math.round(yMax / 2), yMax]

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-5">Heures d&apos;affluence</h2>

      <svg
        viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {yLabelPositions.map((label) => {
          const y = BASELINE - (label / yMax) * CHART_H
          return (
            <g key={label}>
              <text
                x={MARGIN_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-neutral-400"
                fontSize={12}
              >
                {label}
              </text>
              <line
                x1={CHART_X}
                y1={y}
                x2={VIEW_BOX_W - 10}
                y2={y}
                stroke="#E5E5E5"
                strokeWidth={0.5}
              />
            </g>
          )
        })}

        {values.map((val, i) => {
          const barH = (val / yMax) * CHART_H
          const x = CHART_X + i * BAR_SLOT + BAR_GAP / 2
          const y = BASELINE - barH
          const isPeak = i === peak.peakHour
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              rx={2}
              className={isPeak ? "fill-[#FF5722]" : "fill-neutral-200"}
            />
          )
        })}

        <line
          x1={CHART_X}
          y1={BASELINE}
          x2={VIEW_BOX_W - 10}
          y2={BASELINE}
          stroke="#D4D4D4"
          strokeWidth={1}
        />

        {HOURS.filter((h) => h % 2 === 0).map((h) => {
          const x = CHART_X + h * BAR_SLOT + BAR_SLOT / 2
          return (
            <text
              key={h}
              x={x}
              y={BASELINE + 18}
              textAnchor="middle"
              className="fill-neutral-400"
              fontSize={11}
            >
              {h}h
            </text>
          )
        })}
      </svg>

      <p className="text-xs text-neutral-500 mt-3 text-center">
        Heure de pointe :{" "}
        <span className="font-medium text-[#FF5722]">{peak.peakHour}h</span> —{" "}
        {peak.peakHourOrders} commande
        {peak.peakHourOrders > 1 ? "s" : ""}
      </p>
    </div>
  )
}
