import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { SettingsClient, type SettingRow } from "./settings-client"

export default async function SettingsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true })

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  return <SettingsClient settings={(data as SettingRow[]) || []} />
}
