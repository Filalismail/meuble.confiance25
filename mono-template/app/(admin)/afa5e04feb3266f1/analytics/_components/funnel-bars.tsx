import type { FunnelKpis } from "@/lib/analytics-data"
import { localeSafe } from "@/lib/locale-safe"

interface Props {
  kpis: FunnelKpis
}

const steps = [
  { key: "viewers" as const, label: "Vues produit" },
  { key: "cart" as const, label: "Ajouts panier" },
  { key: "checkout" as const, label: "Tentatives paiement" },
  { key: "buyers" as const, label: "Achats" },
]

export function FunnelBars({ kpis }: Props) {
  const max = kpis.views || 1

  const values = {
    viewers: kpis.views,
    cart: kpis.addToCart,
    checkout: kpis.checkouts,
    buyers: kpis.buyers,
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
      <h2 className="text-sm font-medium text-[#0A0A0A] mb-5">Entonnoir de conversion</h2>
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const val = values[step.key]
          const pct = Math.round((val / max) * 100)
          return (
            <div key={step.key}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-600">{step.label}</span>
                <span className="font-medium text-[#0A0A0A]">
                  {localeSafe(val)}
                  <span className="text-neutral-400 ml-1">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === steps.length - 1
                      ? "bg-[#FF5722]"
                      : idx === 0
                        ? "bg-neutral-300"
                        : "bg-[#FF5722]/40"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
