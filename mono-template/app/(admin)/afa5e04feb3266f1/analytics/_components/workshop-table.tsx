"use client"

import { AdminTable, type Column } from "../../../_components/admin-table"
import type { WorkshopDemandRow } from "@/lib/analytics-data"
import { localeSafe } from "@/lib/locale-safe"

interface Props {
  rows: WorkshopDemandRow[]
}

const optionLabels: Record<string, string> = {
  color: "Couleur",
  size: "Dimension",
  material: "Matière",
  finish: "Finition",
}

export function WorkshopTable({ rows }: Props) {
  const columns: Column<WorkshopDemandRow>[] = [
    {
      key: "optionKey",
      label: "Option",
      render: (r) => (
        <span className="text-sm font-medium text-[#0A0A0A]">
          {optionLabels[r.optionKey] || r.optionKey}
        </span>
      ),
    },
    {
      key: "unitsOrdered",
      label: "Unités commandées",
      sortable: true,
      render: (r) => <span className="text-sm">{localeSafe(r.unitsOrdered)}</span>,
    },
    {
      key: "uniqueProducts",
      label: "Produits uniques",
      sortable: true,
      render: (r) => <span className="text-sm text-neutral-500">{localeSafe(r.uniqueProducts)}</span>,
    },
  ]

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-4">Demande atelier</h2>
      <AdminTable<WorkshopDemandRow>
        columns={columns}
        data={rows}
        searchPlaceholder="..."
        searchKeys={["optionKey"]}
        emptyMessage="Aucune donnée"
        mobileCardRender={(r) => (
          <div className="p-3">
            <p className="text-sm font-medium text-[#0A0A0A]">
              {optionLabels[r.optionKey] || r.optionKey}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span>{r.unitsOrdered} unités</span>
              <span>{r.uniqueProducts} produits</span>
            </div>
          </div>
        )}
      />
    </div>
  )
}
