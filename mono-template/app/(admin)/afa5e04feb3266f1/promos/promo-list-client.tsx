"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { AdminTable, type Column } from "../../_components/admin-table"
import { ConfirmDialog } from "../../_components/confirm-dialog"
import { deletePromo } from "../../_actions/promos"

export interface PromoRow {
  id: string
  code: string
  discount_percentage: number
  is_active: boolean
  max_uses: number
  current_uses: number
  created_at: string
}

interface Props {
  promos: PromoRow[]
}

const ADMIN_BASE = "/afa5e04feb3266f1"

function getPromoStatus(p: PromoRow): { label: string; classes: string } {
  if (p.max_uses && p.current_uses >= p.max_uses) {
    return {
      label: "Épuisé / مستنفد",
      classes: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    }
  }
  if (!p.is_active) {
    return {
      label: "Inactif / معطل",
      classes: "bg-neutral-100 text-neutral-400",
    }
  }
  return {
    label: "Actif / مفعّل",
    classes: "bg-emerald-50 text-emerald-600",
  }
}

export function PromoListClient({ promos }: Props) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const toDelete = useMemo(
    () => promos.find((p) => p.id === deleteId),
    [promos, deleteId],
  )

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await deletePromo(deleteId)
    if (result.error) return
    setDeleteId(null)
    router.refresh()
  }

  const columns: Column<PromoRow>[] = useMemo(
    () => [
      {
        key: "code",
        label: "Code",
        render: (p) => (
          <span className="font-mono text-sm font-bold text-[#FF5722]">{p.code}</span>
        ),
      },
      {
        key: "discount_percentage",
        label: "Réduction",
        render: (p) => <span className="text-sm">{p.discount_percentage}%</span>,
      },
      {
        key: "usage",
        label: "Utilisations",
        render: (p) => (
          <span className="text-sm text-neutral-600 font-mono">
            {p.current_uses} / {p.max_uses}
          </span>
        ),
      },
      {
        key: "is_active",
        label: "Statut",
        render: (p) => {
          const status = getPromoStatus(p)
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${status.classes}`}
            >
              {status.label}
            </span>
          )
        },
      },
      {
        key: "created_at",
        label: "Créé le",
        sortable: true,
        render: (p) => (
          <span className="text-xs text-neutral-500">
            {new Date(p.created_at).toLocaleDateString("fr-FR")}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (p) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`${ADMIN_BASE}/promos/${p.id}`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => setDeleteId(p.id)}
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
        <h1 className="text-xl font-medium text-[#0A0A0A]">Codes Promo</h1>
        <button
          onClick={() => router.push(`${ADMIN_BASE}/promos/new`)}
          className="flex items-center gap-2 px-4 h-9 rounded-xl bg-[#FF5722] text-white text-xs font-medium hover:bg-[#FF5722]/90 transition-colors"
        >
          <Plus size={14} />
          Nouveau
        </button>
      </div>

      <AdminTable<PromoRow>
        columns={columns}
        data={promos}
        searchPlaceholder="Rechercher un code..."
        searchKeys={["code"]}
        emptyMessage="Aucun code promo trouvé"
        mobileCardRender={(p) => (
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-mono text-sm font-bold text-[#FF5722]">{p.code}</span>
                <p className="text-xs text-neutral-500">{p.discount_percentage}% de réduction</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPromoStatus(p).classes}`}
              >
                {getPromoStatus(p).label}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Utilisé {p.current_uses}/{p.max_uses} fois</span>
              <span>{new Date(p.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E5]/40">
              <button
                onClick={() => router.push(`${ADMIN_BASE}/promos/${p.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-[#FF5722]/5 hover:text-[#FF5722] transition-colors"
              >
                <Edit2 size={13} />
                Modifier
              </button>
              <button
                onClick={() => setDeleteId(p.id)}
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
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Supprimer le code promo"
        message={`Supprimer le code "${toDelete?.code}" ? Cette action est irréversible.`}
        variant="danger"
      />
    </div>
  )
}
