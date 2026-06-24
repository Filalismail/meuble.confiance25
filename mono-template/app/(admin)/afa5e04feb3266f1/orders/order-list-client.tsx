"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"
import { AdminTable, type Column } from "../../_components/admin-table"
import { StatusBadge } from "../../_components/status-badge"
import type { OrderStatus } from "@/lib/types"
import { localeSafe } from "@/lib/locale-safe"

export interface WilayaInfo {
  name_ar: string
  name_fr: string
}

export interface OrderRow {
  id: string
  customer_first_name: string
  customer_last_name: string
  phone_number: string
  delivery_type: string
  status: string
  final_total: number
  created_at: string
  wilayas: WilayaInfo
}

interface Props {
  orders: OrderRow[]
}

const ADMIN_BASE = "/afa5e04feb3266f1"

type StatusFilter = "all" | "incomplete" | "processing" | "complete" | "cancelled"

const filterGroups: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "incomplete", label: "Incomplètes" },
  { key: "processing", label: "En cours" },
  { key: "complete", label: "Terminées" },
  { key: "cancelled", label: "Annulées" },
]

function matchFilter(status: string, filter: StatusFilter): boolean {
  if (filter === "all") return true
  if (filter === "incomplete") return status === "pending"
  if (filter === "processing") return status === "confirmed" || status === "shipped"
  if (filter === "complete") return status === "delivered"
  if (filter === "cancelled") return status === "cancelled"
  return true
}

export function OrderListClient({ orders }: Props) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(
    () => orders.filter((o) => matchFilter(o.status, statusFilter)),
    [orders, statusFilter],
  )

  const columns: Column<OrderRow>[] = useMemo(
    () => [
      {
        key: "id",
        label: "Commande",
        render: (o) => (
          <span className="font-mono text-xs text-neutral-500">#{o.id.slice(0, 8)}</span>
        ),
      },
      {
        key: "customer",
        label: "Client",
        render: (o) => (
          <span className="text-sm font-medium">
            {o.customer_first_name} {o.customer_last_name}
          </span>
        ),
      },
      {
        key: "phone_number",
        label: "Téléphone",
        render: (o) => <span className="text-sm">{o.phone_number}</span>,
      },
      {
        key: "wilayas",
        label: "Wilaya",
        render: (o) => (
          <span className="text-sm text-neutral-600">
            {o.wilayas?.name_fr || "—"}
          </span>
        ),
      },
      {
        key: "delivery_type",
        label: "Livraison",
        render: (o) => (
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
            {o.delivery_type === "home" ? "Domicile" : "Relais"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Statut",
        sortable: true,
        render: (o) => <StatusBadge status={o.status as OrderStatus} />,
      },
      {
        key: "final_total",
        label: "Total",
        sortable: true,
        render: (o) => (
          <span className="font-medium">
            {localeSafe(Number(o.final_total))} DA
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Date",
        sortable: true,
        render: (o) => (
          <span className="text-xs text-neutral-500">
            {new Date(o.created_at).toLocaleDateString("fr-FR")}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (o) => (
          <button
            onClick={() => router.push(`${ADMIN_BASE}/orders/${o.id}`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
          >
            <Eye size={15} />
          </button>
        ),
      },
    ],
    [router],
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-[#0A0A0A]">Commandes</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterGroups.map((fg) => (
          <button
            key={fg.key}
            onClick={() => setStatusFilter(fg.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === fg.key
                ? "bg-[#FF5722] text-white border-[#FF5722]"
                : "bg-white/60 text-neutral-600 border-[#E5E5E5]/60 hover:border-[#FF5722]/40"
            }`}
          >
            {fg.label}
          </button>
        ))}
      </div>

      <AdminTable<OrderRow>
        columns={columns}
        data={filtered}
        searchPlaceholder="Rechercher un client ou téléphone..."
        searchKeys={["customer_first_name", "customer_last_name", "phone_number"]}
        emptyMessage="Aucune commande trouvée"
        mobileCardRender={(o) => (
          <div className="p-4">
            <div
              className="cursor-pointer"
              onClick={() => router.push(`${ADMIN_BASE}/orders/${o.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {o.customer_first_name} {o.customer_last_name}
                  </p>
                  <p className="text-xs text-neutral-500">{o.phone_number}</p>
                </div>
                <StatusBadge status={o.status as OrderStatus} />
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{o.wilayas?.name_fr || "—"} · {o.delivery_type === "home" ? "Domicile" : "Relais"}</span>
                <span className="font-medium text-[#0A0A0A]">
                  {localeSafe(Number(o.final_total))} DA
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                {new Date(o.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E5]/40">
              <button
                onClick={() => router.push(`${ADMIN_BASE}/orders/${o.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-[#FF5722]/5 hover:text-[#FF5722] transition-colors"
              >
                <Eye size={13} />
                Détails
              </button>
            </div>
          </div>
        )}
      />
    </div>
  )
}
