import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { PromoForm } from "../../../_components/promo-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const ADMIN_BASE = "/afa5e04feb3266f1"

export default async function NewPromoPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`${ADMIN_BASE}/promos`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-medium text-[#0A0A0A]">Nouveau code promo</h1>
      </div>
      <PromoForm />
    </div>
  )
}
