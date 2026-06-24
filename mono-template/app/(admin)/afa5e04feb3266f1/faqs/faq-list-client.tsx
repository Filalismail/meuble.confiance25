"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react"
import { AdminTable, type Column } from "../../_components/admin-table"
import { ConfirmDialog } from "../../_components/confirm-dialog"
import { deleteFaq } from "../../_actions/faqs"

export interface FaqRow {
  id: string
  question_ar: string
  question_fr: string
  answer_ar: string
  answer_fr: string
  sort_order: number
  is_active: boolean
  created_at: string
}

interface Props {
  faqs: FaqRow[]
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function FaqListClient({ faqs }: Props) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const toDelete = useMemo(
    () => faqs.find((f) => f.id === deleteId),
    [faqs, deleteId],
  )

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await deleteFaq(deleteId)
    if (result.error) return
    setDeleteId(null)
    router.refresh()
  }

  const columns: Column<FaqRow>[] = useMemo(
    () => [
      {
        key: "sort_order",
        label: "",
        render: (f) => (
          <span className="flex items-center gap-1 text-neutral-300">
            <GripVertical size={14} />
            <span className="text-xs text-neutral-400 font-mono">{f.sort_order}</span>
          </span>
        ),
      },
      {
        key: "question_fr",
        label: "Question (FR)",
        render: (f) => (
          <span className="text-sm text-[#0A0A0A] line-clamp-1">{f.question_fr}</span>
        ),
      },
      {
        key: "question_ar",
        label: "السؤال",
        render: (f) => (
          <span className="text-sm text-[#0A0A0A] line-clamp-1" dir="rtl">{f.question_ar}</span>
        ),
      },
      {
        key: "is_active",
        label: "Statut",
        render: (f) => (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              f.is_active
                ? "bg-emerald-50 text-emerald-600"
                : "bg-neutral-100 text-neutral-400"
            }`}
          >
            {f.is_active ? "Actif" : "Inactif"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (f) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`${ADMIN_BASE}/faqs/${f.id}`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => setDeleteId(f.id)}
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
        <h1 className="text-xl font-medium text-[#0A0A0A]">FAQ</h1>
        <button
          onClick={() => router.push(`${ADMIN_BASE}/faqs/new`)}
          className="flex items-center gap-2 px-4 h-9 rounded-xl bg-[#FF5722] text-white text-xs font-medium hover:bg-[#FF5722]/90 transition-colors"
        >
          <Plus size={14} />
          Nouvelle FAQ
        </button>
      </div>

      <AdminTable<FaqRow>
        columns={columns}
        data={faqs}
        searchPlaceholder="Rechercher une question..."
        searchKeys={["question_fr", "question_ar"]}
        emptyMessage="Aucune FAQ trouvée"
        mobileCardRender={(f) => (
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A] line-clamp-1">{f.question_fr}</p>
                <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5" dir="rtl">{f.question_ar}</p>
              </div>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                  f.is_active
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {f.is_active ? "Actif" : "Inactif"}
              </span>
            </div>
            <p className="text-xs text-neutral-400">Ordre: {f.sort_order}</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E5]/40">
              <button
                onClick={() => router.push(`${ADMIN_BASE}/faqs/${f.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-[#FF5722]/5 hover:text-[#FF5722] transition-colors"
              >
                <Edit2 size={13} />
                Modifier
              </button>
              <button
                onClick={() => setDeleteId(f.id)}
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
        title="Supprimer la FAQ"
        message={`Supprimer cette question ? Cette action est irréversible.`}
        variant="danger"
      />
    </div>
  )
}
