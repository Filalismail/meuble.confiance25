import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { fetchDashboardMetrics } from "@/lib/dashboard-data"
import { localeSafe } from "@/lib/locale-safe"

export default async function DashboardPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const metrics = await fetchDashboardMetrics()

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-medium text-[#0A0A0A]">
          Tableau de bord
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Bienvenue dans l&apos;administration Thika 25
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          label="Revenu total"
          sub="إجمالي المداخيل"
          value={`${localeSafe(metrics.totalRevenue)} DA`}
          icon={<RevenueIcon />}
        />
        <StatsCard
          label="Commandes"
          sub="عدد الطلبات"
          value={localeSafe(metrics.totalOrders)}
          icon={<OrdersIcon />}
        />
        <StatsCard
          label="Promos utilisées"
          sub="استخدامات الخصم"
          value={localeSafe(metrics.promoCodeUses)}
          icon={<PromoIcon />}
        />
        <StatsCard
          label="Produits vendus"
          sub="المنتجات المباعة"
          value={localeSafe(metrics.productsSold)}
          icon={<SoldIcon />}
        />
      </div>
    </div>
  )
}

function StatsCard({
  label,
  sub,
  value,
  icon,
}: {
  label: string
  sub: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-[#FF5722]/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-[10px] text-neutral-400" dir="rtl">{sub}</p>
        </div>
      </div>
      <p className="text-2xl font-medium text-[#0A0A0A]">{value}</p>
    </div>
  )
}

function RevenueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M8 12h9" />
      <path d="M10 8h4" />
      <path d="M10 16h4" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}

function PromoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  )
}

function SoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  )
}
