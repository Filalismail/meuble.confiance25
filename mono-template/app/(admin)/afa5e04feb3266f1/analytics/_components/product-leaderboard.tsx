import type { TopProductRow } from "@/lib/analytics-data"

interface Props {
  rows: TopProductRow[]
}

export function ProductLeaderboard({ rows }: Props) {
  const maxQty = rows.length > 0 ? rows[0].totalQuantity : 1

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-[#0A0A0A]">Top Produits</h2>
          <p className="text-[10px] text-neutral-400" dir="rtl">أهم المنتجات</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-xs text-neutral-400">
          Aucun produit vendu
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, idx) => {
            const pct = (row.totalQuantity / maxQty) * 100
            return (
              <div key={row.productId}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-300 w-4">{idx + 1}</span>
                    <span className="text-neutral-700">{row.nameFr}</span>
                  </div>
                  <span className="text-[#0A0A0A] font-medium">
                    {row.totalQuantity} unité{row.totalQuantity > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-blue-500/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
