import type { OrderStatus } from "@/lib/types"

interface Props {
  status: OrderStatus
}

const config: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "En attente" },
  confirmed: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Confirmée" },
  shipped: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "Expédiée" },
  delivered: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Livrée" },
  cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Annulée" },
}

export function StatusBadge({ status }: Props) {
  const c = config[status] ?? config.pending
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  )
}
