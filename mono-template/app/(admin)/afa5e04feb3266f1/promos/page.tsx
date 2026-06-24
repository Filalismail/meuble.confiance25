import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { PromoListClient, type PromoRow } from "./promo-list-client"

export default async function PromosPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  return <PromoListClient promos={(data as unknown as PromoRow[]) || []} />
}
