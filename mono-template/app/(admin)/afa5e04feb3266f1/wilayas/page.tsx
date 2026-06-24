import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { WilayaListClient, type WilayaRow } from "./wilaya-list-client"

export default async function WilayasPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data, error } = await supabaseAdmin
    .from("wilayas")
    .select("*")
    .order("id", { ascending: true })

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  return <WilayaListClient wilayas={(data as unknown as WilayaRow[]) || []} />
}
