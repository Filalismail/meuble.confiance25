import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { WilayaForm } from "../../../_components/wilaya-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export default async function EditWilayaPage({ params }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { id } = await params
  const wilayaId = Number(id)

  if (isNaN(wilayaId)) return <div className="text-sm text-red-500">ID invalide</div>

  const { data, error } = await supabaseAdmin
    .from("wilayas")
    .select("*")
    .eq("id", wilayaId)
    .single()

  if (error || !data) return <div className="text-sm text-red-500">Wilaya introuvable</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`${ADMIN_BASE}/wilayas`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-medium text-[#0A0A0A]">Modifier {data.name_fr}</h1>
      </div>
      <WilayaForm
        wilaya={{
          id: data.id,
          nameAr: data.name_ar,
          nameFr: data.name_fr,
          shippingHomeFee: Number(data.shipping_home_fee),
          shippingDeskFee: Number(data.shipping_desk_fee),
          isActive: data.is_active,
        }}
      />
    </div>
  )
}
