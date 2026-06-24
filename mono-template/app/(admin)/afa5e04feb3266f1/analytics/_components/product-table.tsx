"use client"

import { AdminTable, type Column } from "../../../_components/admin-table"
import type { ProductPerfRow } from "@/lib/analytics-data"
import { localeSafe } from "@/lib/locale-safe"

interface Props {
  rows: ProductPerfRow[]
}

export function ProductTable({ rows }: Props) {
  const columns: Column<ProductPerfRow>[] = [
    { key: "nameFr", label: "Produit", render: (r) => <span className="text-sm font-medium text-[#0A0A0A]">{r.nameFr}</span> },
    { key: "views", label: "Vues", sortable: true, render: (r) => <span className="text-sm">{localeSafe(r.views)}</span> },
    { key: "addToCart", label: "Panier", sortable: true, render: (r) => <span className="text-sm">{localeSafe(r.addToCart)}</span> },
    { key: "checkouts", label: "Commandes", sortable: true, render: (r) => <span className="text-sm">{localeSafe(r.checkouts)}</span> },
    {
      key: "conversionRate",
      label: "Taux",
      sortable: true,
      render: (r) => (
        <span className="text-sm font-medium text-emerald-600">
          {r.conversionRate.toFixed(1)}%
        </span>
      ),
    },
  ]

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-4">Performance des produits</h2>
      <AdminTable<ProductPerfRow>
        columns={columns}
        data={rows}
        searchPlaceholder="Rechercher un produit..."
        searchKeys={["nameFr", "nameAr"]}
        emptyMessage="Aucun produit"
        mobileCardRender={(r) => (
          <div className="p-3">
            <p className="text-sm font-medium text-[#0A0A0A]">{r.nameFr}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span>Vues: {localeSafe(r.views)}</span>
              <span>Panier: {localeSafe(r.addToCart)}</span>
              <span>Cmd: {localeSafe(r.checkouts)}</span>
            </div>
          </div>
        )}
      />
    </div>
  )
}
