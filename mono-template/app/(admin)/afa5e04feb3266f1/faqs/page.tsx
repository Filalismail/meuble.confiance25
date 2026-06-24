import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { FaqListClient, type FaqRow } from "./faq-list-client"

export default async function FaqsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  return <FaqListClient faqs={(data as unknown as FaqRow[]) || []} />
}
