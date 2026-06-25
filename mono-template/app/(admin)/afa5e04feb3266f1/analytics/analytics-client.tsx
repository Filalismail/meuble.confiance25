"use client"

import { useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { AnalyticsSummary } from "@/lib/analytics-data"
import { KpiCards } from "./_components/kpi-cards"
import { RevenueTimeline } from "./_components/revenue-timeline"
import { WilayaLeaderboard } from "./_components/wilaya-leaderboard"
import { ProductLeaderboard } from "./_components/product-leaderboard"
import { FunnelBars } from "./_components/funnel-bars"
import { SourceProportionBar } from "./_components/source-proportion-bar"
import { PeakChart } from "./_components/peak-chart"
import { ProductTable } from "./_components/product-table"
import { GeoTable } from "./_components/geo-table"
interface Props {
  data: AnalyticsSummary
  range: string
}

const pills = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "90d", label: "90 jours" },
  { key: "all", label: "Tout" },
]

export function AnalyticsClient({ data, range }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRangeChange = useCallback(
    (key: string) => {
      startTransition(() => {
        router.push(`/afa5e04feb3266f1/analytics?range=${key}`)
      })
    },
    [router],
  )

  return (
    <div className="space-y-8 relative">
      {isPending && (
        <div className="absolute inset-0 z-10 bg-white/30 backdrop-blur-[1px] rounded-2xl pointer-events-none" />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#0A0A0A]">Analytiques</h1>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100/60">
          {pills.map((p) => (
            <button
              key={p.key}
              onClick={() => handleRangeChange(p.key)}
              disabled={isPending}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === p.key
                  ? "bg-[#FF5722] text-white shadow-sm"
                  : "text-neutral-500 hover:text-[#0A0A0A]"
              } disabled:opacity-50`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <KpiCards
        totalRevenue={data.revenueTimeline.reduce((s, r) => s + r.revenue, 0)}
        totalOrders={data.revenueTimeline.reduce((s, r) => s + r.orderCount, 0)}
        productsSold={data.topProducts.reduce((s, p) => s + p.totalQuantity, 0)}
        pageViewers={data.pageViewers}
      />

      <RevenueTimeline rows={data.revenueTimeline} />
      <WilayaLeaderboard rows={data.topWilayas} />
      <ProductLeaderboard rows={data.topProducts} />

      {data.funnelKpis && data.funnelKpis.views > 0 && (
        <FunnelBars kpis={data.funnelKpis} />
      )}

      {data.productPerformance.length > 0 && (
        <ProductTable rows={data.productPerformance} />
      )}

      <SourceProportionBar sources={data.marketingSources} />

      {data.geoDemand.length > 0 && <GeoTable rows={data.geoDemand} />}

      {data.temporalPeak && data.temporalPeak.peakHourOrders > 0 && (
        <PeakChart peak={data.temporalPeak} />
      )}

      <p className="text-[10px] text-neutral-300 text-center">
        Données du {data.summaryDates.dateFrom} au {data.summaryDates.dateTo}
      </p>
    </div>
  )
}
