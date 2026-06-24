"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown } from "lucide-react"
import { batchUpdateProductOrder } from "../_actions/categories"

export interface ProductItem {
  id: string
  name_fr: string
  name_ar: string
  primary_image: string
}

interface Props {
  products: ProductItem[]
}

export function ProductOrderManager({ products: initial }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [saving, setSaving] = useState(false)

  const move = useCallback((idx: number, dir: "up" | "down") => {
    setProducts((prev) => {
      const target = dir === "up" ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const tmp = next[idx]
      next[idx] = next[target]
      next[target] = tmp
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    const items = products.map((p, i) => ({ id: p.id, sortOrder: i }))
    const result = await batchUpdateProductOrder(items)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setSaving(false)
  }, [products, router])

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-[#0A0A0A]">Ordre des produits</h2>
          <p className="text-[10px] text-neutral-400" dir="rtl">ترتيب المنتجات</p>
        </div>
        {products.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 h-8 rounded-lg bg-[#FF5722] text-white text-xs font-medium hover:bg-[#FF5722]/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "..." : "Enregistrer l'ordre"}
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-xs text-neutral-400">
          Aucun produit dans cette catégorie
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-[#E5E5E5]/40"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                {p.primary_image ? (
                  <img
                    src={p.primary_image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A] truncate">{p.name_fr}</p>
                {p.name_ar && (
                  <p className="text-xs text-neutral-400 truncate" dir="rtl">{p.name_ar}</p>
                )}
              </div>
              <span className="text-[10px] text-neutral-300 tabular-nums w-6 text-center">{i + 1}</span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => move(i, "up")}
                  disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-[#FF5722] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => move(i, "down")}
                  disabled={i >= products.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-[#FF5722] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
