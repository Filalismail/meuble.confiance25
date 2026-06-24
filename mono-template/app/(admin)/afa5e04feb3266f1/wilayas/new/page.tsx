import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { WilayaForm } from "../../../_components/wilaya-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const ADMIN_BASE = "/afa5e04feb3266f1"

export default async function NewWilayaPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`${ADMIN_BASE}/wilayas`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-medium text-[#0A0A0A]">Nouvelle wilaya</h1>
      </div>
      <WilayaForm />
    </div>
  )
}
