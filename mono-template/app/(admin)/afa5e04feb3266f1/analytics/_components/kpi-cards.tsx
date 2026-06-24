"use client"

import { localeSafe } from "@/lib/locale-safe"

interface Props {
  totalRevenue: number
  totalOrders: number
  productsSold: number
  pageViewers: number
}

export function KpiCards({ totalRevenue, totalOrders, productsSold, pageViewers }: Props) {
  const cards = [
    { label: "Chiffre d'affaires", value: `${localeSafe(totalRevenue)} DA`, sub: "revenu total" },
    { label: "Commandes", value: localeSafe(totalOrders), sub: "total" },
    { label: "Produits vendus", value: localeSafe(productsSold), sub: "quantité totale" },
    { label: "Visiteurs", value: localeSafe(pageViewers), sub: "visiteurs uniques" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-5 shadow-sm space-y-1"
        >
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{card.label}</p>
          <p className="text-2xl font-medium text-[#0A0A0A]">{card.value}</p>
          <p className="text-[11px] text-neutral-400">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
