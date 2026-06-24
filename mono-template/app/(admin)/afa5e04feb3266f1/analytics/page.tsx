import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { AnalyticsClient } from "./analytics-client"
import { fetchAnalyticsSummary } from "@/lib/analytics-data"

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}

function resolveDateRange(params: Awaited<Props["searchParams"]>): {
  dateFrom: string
  dateTo: string
} {
  const range = params.range || "7d"

  if (params.from && params.to) return { dateFrom: params.from, dateTo: params.to }

  const now = new Date()
  const dateTo = now.toISOString().slice(0, 10)

  const from = new Date(now)
  if (range === "all") {
    from.setFullYear(2020)
    from.setMonth(0)
    from.setDate(1)
  } else if (range === "today") {
  } else if (range === "7d") {
    from.setDate(from.getDate() - 7)
  } else if (range === "30d") {
    from.setDate(from.getDate() - 30)
  } else if (range === "90d") {
    from.setDate(from.getDate() - 90)
  } else {
    from.setDate(from.getDate() - 7)
  }

  return { dateFrom: from.toISOString().slice(0, 10), dateTo }
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const params = await searchParams
  const { dateFrom, dateTo } = resolveDateRange(params)
  const data = await fetchAnalyticsSummary(dateFrom, dateTo)

  return <AnalyticsClient data={data} range={params.range || "7d"} />
}
