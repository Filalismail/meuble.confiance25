import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { PromoForm } from "../../../_components/promo-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { PromoCode } from "@/lib/types"

interface Props {
  params: Promise<{ id: string }>
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export default async function EditPromoPage({ params }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return <div className="text-sm text-red-500">Code promo introuvable</div>

  const promo = data as unknown as PromoCode

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`${ADMIN_BASE}/promos`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-medium text-[#0A0A0A]">Modifier {promo.code}</h1>
      </div>
      <PromoForm
        promo={{
          id: promo.id,
          code: promo.code,
          discountPercentage: promo.discountPercentage,
          isActive: promo.isActive,
          maxUses: promo.maxUses,
          currentUses: promo.currentUses,
        }}
      />
    </div>
  )
}
