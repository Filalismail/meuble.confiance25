"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Edit2, Trash2 } from "lucide-react"
import { AdminTable, type Column } from "../../_components/admin-table"
import { ConfirmDialog } from "../../_components/confirm-dialog"
import { deleteWilaya } from "../../_actions/wilayas"
import { localeSafe } from "@/lib/locale-safe"

export interface WilayaRow {
  id: number
  name_ar: string
  name_fr: string
  shipping_home_fee: number
  shipping_desk_fee: number
  is_active: boolean
}

interface Props {
  wilayas: WilayaRow[]
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function WilayaListClient({ wilayas }: Props) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all")

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? wilayas
        : wilayas.filter((w) =>
            activeFilter === "active" ? w.is_active : !w.is_active,
          ),
    [wilayas, activeFilter],
  )

  const toDelete = useMemo(
    () => wilayas.find((w) => w.id === deleteId),
    [wilayas, deleteId],
  )

  const handleDelete = async () => {
    if (deleteId === null) return
    const result = await deleteWilaya(deleteId)
    if (result.error) return
    setDeleteId(null)
    router.refresh()
  }

  const columns: Column<WilayaRow>[] = useMemo(
    () => [
      {
        key: "id",
        label: "Code",
        render: (w) => (
          <span className="font-mono text-xs text-neutral-400">{String(w.id).padStart(2, "0")}</span>
        ),
      },
      {
        key: "name_fr",
        label: "Wilaya (FR)",
        render: (w) => <span className="text-sm font-medium">{w.name_fr}</span>,
      },
      {
        key: "name_ar",
        label: "(AR)",
        render: (w) => (
          <span className="text-sm text-neutral-600" dir="rtl">{w.name_ar}</span>
        ),
      },
      {
        key: "shipping_home_fee",
        label: "Domicile",
        sortable: true,
        render: (w) => (
          <span className="text-sm">{localeSafe(Number(w.shipping_home_fee))} DA</span>
        ),
      },
      {
        key: "shipping_desk_fee",
        label: "Relais",
        sortable: true,
        render: (w) => (
          <span className="text-sm">{localeSafe(Number(w.shipping_desk_fee))} DA</span>
        ),
      },
      {
        key: "is_active",
        label: "Statut",
        render: (w) => (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              w.is_active
                ? "bg-emerald-50 text-emerald-600"
                : "bg-neutral-100 text-neutral-400"
            }`}
          >
            {w.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (w) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`${ADMIN_BASE}/wilayas/${w.id}`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => setDeleteId(w.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [router],
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-[#0A0A0A]">Wilayas</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all" as const, label: "Toutes" },
          { key: "active" as const, label: "Actives" },
          { key: "inactive" as const, label: "Inactives" },
        ].map((fg) => (
          <button
            key={fg.key}
            onClick={() => setActiveFilter(fg.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === fg.key
                ? "bg-[#FF5722] text-white border-[#FF5722]"
                : "bg-white/60 text-neutral-600 border-[#E5E5E5]/60 hover:border-[#FF5722]/40"
            }`}
          >
            {fg.label}
          </button>
        ))}
      </div>

      <AdminTable<WilayaRow>
        columns={columns}
        data={filtered}
        searchPlaceholder="Rechercher une wilaya..."
        searchKeys={["name_fr", "name_ar"]}
        emptyMessage="Aucune wilaya trouvée"
        mobileCardRender={(w) => (
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">{w.name_fr}</p>
                <p className="text-xs text-neutral-500" dir="rtl">{w.name_ar}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  w.is_active
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {w.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
              <span>Domicile: {localeSafe(Number(w.shipping_home_fee))} DA</span>
              <span>Relais: {localeSafe(Number(w.shipping_desk_fee))} DA</span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E5]/40">
              <button
                onClick={() => router.push(`${ADMIN_BASE}/wilayas/${w.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-[#FF5722]/5 hover:text-[#FF5722] transition-colors"
              >
                <Edit2 size={13} />
                Modifier
              </button>
              <button
                onClick={() => setDeleteId(w.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
                Supprimer
              </button>
            </div>
          </div>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Supprimer la wilaya"
        message={`Supprimer "${toDelete?.name_fr}" ? Cette action est irréversible.`}
        variant="danger"
      />
    </div>
  )
}
