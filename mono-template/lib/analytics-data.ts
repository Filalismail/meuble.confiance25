import { supabaseAdmin } from "./supabase-admin"

const WILAYAS_FR: Record<number, string> = {
  1: "Adrar", 2: "Chlef", 3: "Laghouat", 4: "Oum El Bouaghi", 5: "Batna",
  6: "Béjaïa", 7: "Biskra", 8: "Béchar", 9: "Blida", 10: "Bouira",
  11: "Tamanrasset", 12: "Tébessa", 13: "Tlemcen", 14: "Tiaret", 15: "Tizi Ouzou",
  16: "Alger", 17: "Djelfa", 18: "Jijel", 19: "Sétif", 20: "Saïda",
  21: "Skikda", 22: "Sidi Bel Abbès", 23: "Annaba", 24: "Guelma", 25: "Constantine",
  26: "Médéa", 27: "Mostaganem", 28: "M'Sila", 29: "Mascara", 30: "Ouargla",
  31: "Oran", 32: "El Bayadh", 33: "Illizi", 34: "Bordj Bou Arréridj",
  35: "Boumerdès", 36: "El Tarf", 37: "Tindouf", 38: "Tissemsilt",
  39: "El Oued", 40: "Khenchela", 41: "Souk Ahras", 42: "Tipaza",
  43: "Mila", 44: "Aïn Defla", 45: "Naâma", 46: "Aïn Témouchent",
  47: "Ghardaïa", 48: "Relizane", 49: "Timimoun", 50: "Bordj Badji Mokhtar",
  51: "Ouled Djellal", 52: "Béni Abbès", 53: "In Salah", 54: "In Guezzam",
  55: "Touggourt", 56: "Djanet", 57: "El M'Ghair", 58: "El Meniaa",
}

export interface ProductPerfRow {
  productId: string
  nameFr: string
  nameAr: string
  views: number
  addToCart: number
  checkouts: number
  conversionRate: number
}

export interface MarketingSourceRow {
  source: string
  totalVisitors: number
}

export interface GeoDemandRow {
  wilayaId: number
  wilayaNameFr: string
  totalOrders: number
  totalRevenue: number
  shippingHome: number
  shippingDesk: number
  avgOrderValue: number
}

export interface FunnelKpis {
  views: number
  addToCart: number
  checkouts: number
  buyers: number
  abandonmentRate: number
}

export interface TemporalPeak {
  peakHour: number
  peakHourOrders: number
  hourlyBreakdown: Record<string, number>
}

export interface RevenueTimelineRow {
  month: string
  label: string
  revenue: number
  orderCount: number
}

export interface TopWilayaRow {
  wilayaId: number
  wilayaNameFr: string
  totalOrders: number
  totalRevenue: number
}

export interface TopProductRow {
  productId: string
  nameFr: string
  nameAr: string
  totalQuantity: number
}

export interface AnalyticsSummary {
  productPerformance: ProductPerfRow[]
  funnelKpis: FunnelKpis | null
  marketingSources: MarketingSourceRow[]
  geoDemand: GeoDemandRow[]
  temporalPeak: TemporalPeak | null
  revenueTimeline: RevenueTimelineRow[]
  topWilayas: TopWilayaRow[]
  topProducts: TopProductRow[]
  pageViewers: number
  summaryDates: { dateFrom: string; dateTo: string }
}

function safeNum(val: unknown): number {
  if (typeof val === "number") return val
  if (typeof val === "string") return Number(val) || 0
  return 0
}

export async function fetchAnalyticsSummary(
  dateFrom: string,
  dateTo: string,
): Promise<AnalyticsSummary> {
  try {
    await supabaseAdmin.rpc("aggregate_daily_analytics", { p_date: dateTo })
  } catch (e) {
    console.error("Auto-aggregate error:", e)
  }

  const { data: rows, error } = await supabaseAdmin
    .from("daily_analytics_summary")
    .select("*")
    .gte("summary_date", dateFrom)
    .lte("summary_date", dateTo)
    .order("summary_date", { ascending: false })

  if (error || !rows) {
    console.error("Analytics fetch error:", error)
    return {
      productPerformance: [],
      funnelKpis: null,
      marketingSources: [],
      geoDemand: [],
      temporalPeak: null,
      revenueTimeline: [],
      topWilayas: [],
      topProducts: [],
      pageViewers: 0,
      summaryDates: { dateFrom, dateTo },
    }
  }

  const productPerfMap = new Map<string, ProductPerfRow>()
  const funnelKpis: FunnelKpis = {
    views: 0, addToCart: 0,
    checkouts: 0, buyers: 0, abandonmentRate: 0,
  }
  const marketingSourcesMap = new Map<string, number>()
  const geoDemandMap = new Map<number, GeoDemandRow>()
  let temporalPeak: TemporalPeak | null = null

  const productIds = new Set<string>()

  for (const row of rows) {
    const data = row.metric_data as Record<string, unknown> || {}

    if (row.metric_type === "product_performance") {
      productIds.add(row.metric_key)
      productPerfMap.set(row.metric_key, {
        productId: row.metric_key,
        nameFr: "",
        nameAr: "",
        views: safeNum(data.views) + (productPerfMap.get(row.metric_key)?.views || 0),
        addToCart: safeNum(data.add_to_cart) + (productPerfMap.get(row.metric_key)?.addToCart || 0),
        checkouts: safeNum(data.checkouts) + (productPerfMap.get(row.metric_key)?.checkouts || 0),
        conversionRate: 0,
      })
    }

    if (row.metric_type === "funnel_kpis") {
      funnelKpis.views += safeNum(data.views)
      funnelKpis.addToCart += safeNum(data.add_to_cart)
      funnelKpis.checkouts += safeNum(data.checkouts)
      funnelKpis.buyers += safeNum(data.buyers)
    }

    if (row.metric_type === "marketing_source") {
      const current = marketingSourcesMap.get(row.metric_key) || 0
      marketingSourcesMap.set(row.metric_key, current + safeNum(data.total_visitors))
    }

    if (row.metric_type === "geo_demand") {
      const wilayaId = Number(row.metric_key.replace("wilaya_", ""))
      const existing = geoDemandMap.get(wilayaId)
      geoDemandMap.set(wilayaId, {
        wilayaId,
        wilayaNameFr: WILAYAS_FR[wilayaId] || `Wilaya ${wilayaId}`,
        totalOrders: safeNum(data.total_orders) + (existing?.totalOrders || 0),
        totalRevenue: safeNum(data.total_revenue) + (existing?.totalRevenue || 0),
        shippingHome: safeNum(data.shipping_home) + (existing?.shippingHome || 0),
        shippingDesk: safeNum(data.shipping_desk) + (existing?.shippingDesk || 0),
        avgOrderValue: 0,
      })
    }

    if (row.metric_type === "temporal_peak") {
      if (!temporalPeak) {
        temporalPeak = {
          peakHour: safeNum(data.peak_hour),
          peakHourOrders: safeNum(data.peak_hour_orders),
          hourlyBreakdown: {},
        }
      }
      const breakdown = data.hourly_breakdown as Record<string, number> || {}
      for (const [hour, count] of Object.entries(breakdown)) {
        temporalPeak.hourlyBreakdown[hour] =
          (temporalPeak.hourlyBreakdown[hour] || 0) + safeNum(count)
      }
      if (temporalPeak.peakHourOrders < safeNum(data.peak_hour_orders)) {
        temporalPeak.peakHour = safeNum(data.peak_hour)
        temporalPeak.peakHourOrders = safeNum(data.peak_hour_orders)
      }
    }
  }

  if (productIds.size > 0) {
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name_ar, name_fr")
      .in("id", Array.from(productIds))

    const productMap = new Map(
      (products || []).map((p: { id: string; name_ar: string; name_fr: string }) => [
        p.id,
        { nameFr: p.name_fr, nameAr: p.name_ar },
      ]),
    )

    for (const [_id, perf] of productPerfMap) {
      const names = productMap.get(_id)
      perf.nameFr = names?.nameFr || "Produit supprimé"
      perf.nameAr = names?.nameAr || "منتج محذوف"
      perf.conversionRate =
        perf.views > 0 ? Math.round((perf.checkouts / perf.views) * 1000) / 10 : 0
    }
  }

  funnelKpis.abandonmentRate =
    funnelKpis.addToCart > 0
      ? Math.round(
          ((funnelKpis.addToCart - funnelKpis.buyers) /
            funnelKpis.addToCart) *
            100 *
            100,
        ) / 100
      : 0

  for (const geo of geoDemandMap.values()) {
    geo.avgOrderValue =
      geo.totalOrders > 0
        ? Math.round((geo.totalRevenue / geo.totalOrders) * 100) / 100
        : 0
  }

  // ── Order-based aggregations ──
  const revenueTimeline: RevenueTimelineRow[] = []
  const topWilayas: TopWilayaRow[] = []
  const topProducts: TopProductRow[] = []

  console.log("🔍 Analytics Range:", dateFrom, "to", dateTo)

  const { data: validOrders } = await supabaseAdmin
    .from("orders")
    .select("final_total, created_at, wilaya_id, items_json")
    .in("status", ["confirmed", "shipped", "delivered"])
    .gte("created_at", `${dateFrom}T00:00:00Z`)
    .lte("created_at", `${dateTo}T23:59:59Z`)

  console.log("🔍 Active Orders in range:", validOrders?.length, validOrders)

  if (validOrders && validOrders.length > 0) {
    const timelineMap = new Map<string, { revenue: number; count: number }>()
    const wilayaMap = new Map<number, { totalOrders: number; totalRevenue: number }>()
    const productQtyMap = new Map<string, number>()
    const productIds = new Set<string>()

    for (const order of validOrders) {
      const monthKey = order.created_at?.slice(0, 7) || "unknown"
      const te = timelineMap.get(monthKey) || { revenue: 0, count: 0 }
      te.revenue += Number(order.final_total) || 0
      te.count++
      timelineMap.set(monthKey, te)

      const wId = order.wilaya_id
      const we = wilayaMap.get(wId) || { totalOrders: 0, totalRevenue: 0 }
      we.totalOrders++
      we.totalRevenue += Number(order.final_total) || 0
      wilayaMap.set(wId, we)

      const items: Array<{ product_id: string; quantity: number }> = Array.isArray(order.items_json)
        ? order.items_json
        : typeof order.items_json === "string"
          ? JSON.parse(order.items_json)
          : []
      for (const item of items) {
        const pid = item.product_id
        productQtyMap.set(pid, (productQtyMap.get(pid) || 0) + (item.quantity || 0))
        if (pid) productIds.add(pid)
      }
    }

    const monthsFr = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
    ]

    for (const [month, data] of Array.from(timelineMap.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      const m = Number.parseInt(month.slice(5), 10)
      revenueTimeline.push({
        month,
        label: m >= 1 && m <= 12 ? monthsFr[m - 1] : month,
        revenue: data.revenue,
        orderCount: data.count,
      })
    }

    for (const [id, data] of wilayaMap) {
      topWilayas.push({
        wilayaId: id,
        wilayaNameFr: WILAYAS_FR[id] || `Wilaya ${id}`,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
      })
    }
    topWilayas.sort((a, b) => b.totalRevenue - a.totalRevenue)

    if (productIds.size > 0) {
      const { data: dbProducts } = await supabaseAdmin
        .from("products")
        .select("id, name_ar, name_fr")
        .in("id", Array.from(productIds))

      const nameMap = new Map(
        (dbProducts || []).map((p: { id: string; name_ar: string; name_fr: string }) => [p.id, p]),
      )

      for (const [pid, qty] of productQtyMap) {
        const names = nameMap.get(pid)
        topProducts.push({
          productId: pid,
          nameFr: names?.name_fr || "Produit supprimé",
          nameAr: names?.name_ar || "منتج محذوف",
          totalQuantity: qty,
        })
      }
      topProducts.sort((a, b) => b.totalQuantity - a.totalQuantity)
    }
  }

  const { data: visitorCount } = await supabaseAdmin.rpc("get_unique_visitors", {
    p_date_from: dateFrom,
    p_date_to: dateTo,
  })
  const pageViewers = visitorCount ?? 0

  return {
    productPerformance: Array.from(productPerfMap.values()).sort(
      (a, b) => b.views - a.views,
    ),
    funnelKpis,
    marketingSources: Array.from(marketingSourcesMap.entries())
      .map(([source, totalVisitors]) => ({ source, totalVisitors }))
      .sort((a, b) => b.totalVisitors - a.totalVisitors),
    geoDemand: Array.from(geoDemandMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    ),
    temporalPeak,
    revenueTimeline,
    topWilayas,
    topProducts,
    pageViewers,
    summaryDates: { dateFrom, dateTo },
  }
}
