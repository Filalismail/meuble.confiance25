"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AdminTable, type Column } from "../../_components/admin-table"
import { ConfirmDialog } from "../../_components/confirm-dialog"
import type { Category } from "@/lib/types"

interface Props {
  categories: Category[]
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function CategoryListClient({ categories }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deletingId) return
    const { deleteCategory } = await import("../../_actions/categories")
    await deleteCategory(deletingId)
    setDeletingId(null)
    router.refresh()
  }

  const categoryToDelete = categories.find((c) => c.id === deletingId)

  const columns: Column<Category>[] = useMemo(
    () => [
      {
        key: "image",
        label: "Image",
        render: (c) =>
          c.image ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5E5E5]">
              <Image src={c.image} alt="" width={40} height={40} className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-[#E5E5E5]" />
          ),
      },
      { key: "nameFr", label: "Nom (FR)", sortable: true },
      { key: "nameAr", label: "Nom (AR)", sortable: true },
      {
        key: "slug",
        label: "Slug",
        render: (c) => (
          <code className="text-xs px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 font-mono">
            {c.slug}
          </code>
        ),
      },
      {
        key: "sortOrder",
        label: "Ordre",
        sortable: true,
        render: (c) => <span className="text-sm">{c.sortOrder}</span>,
      },
      {
        key: "isActive",
        label: "Statut",
        render: (c) =>
          c.isActive ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Active
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200">
              Inactive
            </span>
          ),
      },
      {
        key: "actions",
        label: "",
        render: (c) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`${ADMIN_BASE}/categories/${c.id}`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeletingId(c.id) }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
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
        <h1 className="text-xl font-medium text-[#0A0A0A]">Catégories</h1>
      </div>

      <AdminTable<Category>
        columns={columns}
        data={categories}
        searchPlaceholder="Rechercher une catégorie..."
        searchKeys={["nameFr", "nameAr", "slug"]}
        emptyMessage="Aucune catégorie trouvée"
        actions={
          <button
            onClick={() => router.push(`${ADMIN_BASE}/categories/new`)}
            className="px-4 py-2.5 rounded-xl bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter
          </button>
        }
        mobileCardRender={(c) => (
          <div className="p-4">
            <div className="flex items-start gap-3">
              {c.image ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E5E5] flex-shrink-0">
                  <Image src={c.image} alt="" width={64} height={64} className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-[#E5E5E5] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A] truncate">{c.nameFr}</p>
                <p className="text-xs text-neutral-500 truncate" dir="rtl">{c.nameAr}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  <code className="text-[10px]">{c.slug}</code> · Ordre {c.sortOrder}
                </p>
                {c.isActive ? (
                  <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Active
                  </span>
                ) : (
                  <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E5]/40">
              <button
                onClick={() => router.push(`${ADMIN_BASE}/categories/${c.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-[#FF5722]/5 hover:text-[#FF5722] transition-colors"
              >
                <Pencil size={13} />
                Modifier
              </button>
              <button
                onClick={() => setDeletingId(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 size={13} />
                Supprimer
              </button>
            </div>
          </div>
        )}
      />

      <ConfirmDialog
        open={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer « ${categoryToDelete?.nameFr || ""} » ? Les produits associés seront également supprimés.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
