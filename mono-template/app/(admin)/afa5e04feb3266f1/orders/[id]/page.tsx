import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { OrderReceipt } from "../../../_components/order-receipt"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export default async function OrderDetailPage({ params }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, wilayas(name_ar, name_fr)")
    .eq("id", id)
    .single()

  if (error || !data) return <div className="text-sm text-red-500">Commande introuvable</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`${ADMIN_BASE}/orders`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-medium text-[#0A0A0A]">
          Commande #{data.id.slice(0, 8)}
        </h1>
      </div>
      <OrderReceipt order={data} />
    </div>
  )
}
