"use client"

import Image from "next/image"
import { localeSafe } from "@/lib/locale-safe"

interface OrderLineItem {
  product_id: string
  name_ar: string
  name_fr: string
  quantity: number
  unit_price: number
  selected_options: Record<string, Record<string, string>>
  line_total: number
}

interface WilayaInfo {
  name_ar: string
  name_fr: string
}

interface OrderDetail {
  id: string
  customer_first_name: string
  customer_last_name: string
  phone_number: string
  wilayas: WilayaInfo
  delivery_type: string
  order_note: string
  items_json: OrderLineItem[]
  subtotal: number
  discount_applied: number
  delivery_fee: number
  final_total: number
  status: string
  created_at: string
}

interface Props {
  order: OrderDetail
}

const statusOptions = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
]

export function OrderReceipt({ order }: Props) {
  const items: OrderLineItem[] = Array.isArray(order.items_json)
    ? order.items_json
    : typeof order.items_json === "string"
      ? JSON.parse(order.items_json)
      : []

  const handleStatusChange = async (newStatus: string) => {
    const { updateOrderStatus } = await import("../_actions/orders")
    await updateOrderStatus(order.id, newStatus)
    window.location.reload()
  }

  const d = new Date(order.created_at)
  const createdAt = `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-[#0A0A0A]">
              Commande #{order.id.slice(0, 8)}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">{createdAt}</p>
          </div>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-xs font-medium focus:outline-none focus:border-[#FF5722]/40"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#E5E5E5]/40 pt-4 mt-4">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Client</p>
            <p className="text-sm font-medium text-[#0A0A0A] mt-0.5">
              {order.customer_first_name} {order.customer_last_name}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Téléphone</p>
            <p className="text-sm font-medium text-[#0A0A0A] mt-0.5">
              {order.phone_number}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Wilaya</p>
            <p className="text-sm font-medium text-[#0A0A0A] mt-0.5">
              {order.wilayas?.name_fr || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Livraison</p>
            <p className="text-sm font-medium text-[#0A0A0A] mt-0.5">
              {order.delivery_type === "home" ? "À domicile" : "Point relais"}
            </p>
          </div>
        </div>

        {order.order_note && (
          <div className="mt-4 pt-4 border-t border-[#E5E5E5]/40">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Note</p>
            <p className="text-sm text-neutral-600">{order.order_note}</p>
          </div>
        )}
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
        <h3 className="text-sm font-medium text-[#0A0A0A] mb-4">Articles</h3>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-[#E5E5E5]/40"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E5E5E5] flex-shrink-0 bg-neutral-50">
                {item.product_id && (
                  <Image
                    src={`https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/shop-assets/products/${item.product_id}.jpg`}
                    alt=""
                    width={56}
                    height={56}
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A]">{item.name_fr}</p>
                <p className="text-xs text-neutral-500" dir="rtl">{item.name_ar}</p>
                {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(item.selected_options).map(([key, val]) => (
                      <span
                        key={key}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500"
                      >
                        {val.val || val.name_fr || val.name_ar || key}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  {item.quantity} × {localeSafe(Number(item.unit_price))} DA
                </p>
              </div>
              <p className="text-sm font-medium text-[#0A0A0A] flex-shrink-0">
                {localeSafe(Number(item.line_total))} DA
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
        <h3 className="text-sm font-medium text-[#0A0A0A] mb-3">Récapitulatif</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-neutral-600">
            <span>Sous-total</span>
            <span>{localeSafe(Number(order.subtotal))} DA</span>
          </div>
          {Number(order.discount_applied) > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Réduction</span>
              <span>-{localeSafe(Number(order.discount_applied))} DA</span>
            </div>
          )}
          <div className="flex items-center justify-between text-neutral-600">
            <span>Livraison</span>
            <span>{localeSafe(Number(order.delivery_fee))} DA</span>
          </div>
          <div className="flex items-center justify-between text-[#0A0A0A] font-medium pt-2 border-t border-[#E5E5E5]/40 mt-2">
            <span>Total</span>
            <span>{localeSafe(Number(order.final_total))} DA</span>
          </div>
        </div>
      </div>
    </div>
  )
}
