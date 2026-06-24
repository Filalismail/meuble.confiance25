import { supabaseAdmin } from "./supabase-admin"

export interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  promoCodeUses: number
  productsSold: number
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("final_total, promo_code, items_json")
    .in("status", ["confirmed", "shipped", "delivered"])

  if (error || !orders) {
    console.error("Dashboard metrics fetch error:", error)
    return { totalRevenue: 0, totalOrders: 0, promoCodeUses: 0, productsSold: 0 }
  }

  let totalRevenue = 0
  let promoCodeUses = 0
  let productsSold = 0

  for (const order of orders) {
    totalRevenue += Number(order.final_total) || 0

    if (order.promo_code && order.promo_code !== "") {
      promoCodeUses++
    }

    const items: Array<{ quantity?: number }> = Array.isArray(order.items_json)
      ? order.items_json
      : typeof order.items_json === "string"
        ? JSON.parse(order.items_json)
        : []
    for (const item of items) {
      productsSold += item.quantity || 0
    }
  }

  return {
    totalRevenue,
    totalOrders: orders.length,
    promoCodeUses,
    productsSold,
  }
}
