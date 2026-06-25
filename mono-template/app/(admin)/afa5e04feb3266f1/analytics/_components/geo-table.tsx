import { AdminTable, type Column } from "../../../_components/admin-table"
import type { GeoDemandRow } from "@/lib/analytics-data"
import { localeSafe } from "@/lib/locale-safe"

interface Props {
  rows: GeoDemandRow[]
}

export function GeoTable({ rows }: Props) {
  const columns: Column<GeoDemandRow>[] = [
    { key: "wilayaNameFr", label: "Wilaya", render: (r) => <span className="text-sm font-medium">{r.wilayaNameFr}</span> },
    { key: "totalOrders", label: "Commandes", sortable: true, render: (r) => <span className="text-sm">{localeSafe(r.totalOrders)}</span> },
    {
      key: "totalRevenue",
      label: "CA",
      sortable: true,
      render: (r) => <span className="text-sm">{localeSafe(r.totalRevenue)} DA</span>,
    },
    {
      key: "avgOrderValue",
      label: "Moyen",
      sortable: true,
      render: (r) => <span className="text-sm text-neutral-500">{localeSafe(r.avgOrderValue)} DA</span>,
    },
    {
      key: "shipping",
      label: "Livraison",
      render: (r) => (
        <span className="text-xs text-neutral-500">
          {r.shippingHome} dom. / {r.shippingDesk} relais
        </span>
      ),
    },
  ]

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-4">Demande géographique</h2>
      <AdminTable<GeoDemandRow>
        columns={columns}
        data={rows}
        searchPlaceholder="Rechercher une wilaya..."
        searchKeys={["wilayaNameFr"]}
        emptyMessage="Aucune donnée"
        mobileCardRender={(r) => (
          <div className="p-3">
            <p className="text-sm font-medium text-[#0A0A0A]">{r.wilayaNameFr}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span>{r.totalOrders} commandes</span>
              <span>{localeSafe(r.totalRevenue)} DA</span>
            </div>
          </div>
        )}
      />
    </div>
  )
}
