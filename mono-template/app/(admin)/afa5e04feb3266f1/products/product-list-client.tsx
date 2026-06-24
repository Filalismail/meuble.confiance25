"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AdminTable, type Column } from "../../_components/admin-table"
import { ConfirmDialog } from "../../_components/confirm-dialog"
import type { Category } from "@/lib/types"
import { localeSafe } from "@/lib/locale-safe"

export interface ProductRow {
  id: string
  name_ar: string
  name_fr: string
  primary_image: string
  base_price: number
  is_featured: boolean
  categories: { slug: string; name_ar: string; name_fr: string }
}

interface Props {
  products: ProductRow[]
  categories: Pick<Category, "id" | "slug" | "nameAr" | "nameFr">[]
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function ProductListClient({ products }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deletingId) return
    const { deleteProduct } = await import("../../_actions/products")
    const result = await deleteProduct(deletingId)
    if (result?.error) return
    setDeletingId(null)
    router.refresh()
  }

  const productToDelete = products.find((p) => p.id === deletingId)

  const columns: Column<ProductRow>[] = useMemo(
    () => [
      {
        key: "image",
        label: "Image",
        render: (p) =>
          p.primary_image ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5E5E5]">
              <Image
                src={p.primary_image}
                alt=""
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-[#E5E5E5]" />
          ),
      },
      { key: "name_fr", label: "Nom (FR)", sortable: true },
      { key: "name_ar", label: "Nom (AR)", sortable: true },
      {
        key: "categories",
        label: "Catégorie",
        render: (p) => (
          <span className="text-sm text-neutral-600">
            {p.categories?.name_fr || "—"}
          </span>
        ),
      },
      {
        key: "base_price",
        label: "Prix",
        sortable: true,
        render: (p) => (
          <span className="font-medium">
            {localeSafe(Number(p.base_price))} DA
          </span>
        ),
      },
      {
        key: "is_featured",
        label: "Vedette",
        render: (p) =>
          p.is_featured ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5722]/10 text-[#FF5722] font-medium">
              Oui
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">Non</span>
          ),
      },
      {
        key: "actions",
        label: "",
        render: (p) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`${ADMIN_BASE}/products/${p.id}`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeletingId(p.id) }}
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
        <h1 className="text-xl font-medium text-[#0A0A0A]">Produits</h1>
      </div>

      <AdminTable<ProductRow>
        columns={columns}
        data={products}
        searchPlaceholder="Rechercher un produit..."
        searchKeys={["name_fr", "name_ar"]}
        emptyMessage="Aucun produit trouvé"
        actions={
          <button
            onClick={() => router.push(`${ADMIN_BASE}/products/new`)}
            className="px-4 py-2.5 rounded-xl bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter
          </button>
        }
        mobileCardRender={(p) => (
          <div className="p-4">
            <div
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => router.push(`${ADMIN_BASE}/products/${p.id}`)}
            >
              {p.primary_image ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E5E5] flex-shrink-0">
                  <Image
                    src={p.primary_image}
                    alt=""
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-[#E5E5E5] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A] truncate">{p.name_fr}</p>
                <p className="text-xs text-neutral-500 truncate" dir="rtl">{p.name_ar}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {p.categories?.name_fr || "—"} · {localeSafe(Number(p.base_price))} DA
                </p>
                {p.is_featured && (
                  <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#FF5722]/10 text-[#FF5722] font-medium">
                    Vedette
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E5]/40">
              <button
                onClick={() => router.push(`${ADMIN_BASE}/products/${p.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-[#FF5722]/5 hover:text-[#FF5722] transition-colors"
              >
                <Pencil size={13} />
                Modifier
              </button>
              <button
                onClick={() => setDeletingId(p.id)}
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
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer « ${productToDelete?.name_fr || ""} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
