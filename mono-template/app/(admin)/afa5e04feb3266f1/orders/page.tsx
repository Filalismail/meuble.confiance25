import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { OrderListClient, type OrderRow } from "./order-list-client"

export default async function OrdersPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, wilayas(name_ar, name_fr)")
    .order("created_at", { ascending: false })

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  return <OrderListClient orders={(data as unknown as OrderRow[]) || []} />
}
