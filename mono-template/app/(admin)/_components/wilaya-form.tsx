"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { createWilaya, updateWilaya } from "../_actions/wilayas"

interface Props {
  wilaya?: {
    id: number
    nameAr: string
    nameFr: string
    shippingHomeFee: number
    shippingDeskFee: number
    isActive: boolean
  }
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function WilayaForm({ wilaya }: Props) {
  const router = useRouter()
  const isEdit = !!wilaya

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = isEdit
        ? await updateWilaya(wilaya.id, formData)
        : await createWilaya(formData)
      if (result.error) return result.error
      router.push(`${ADMIN_BASE}/wilayas`)
      return null
    },
    null,
  )

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {!isEdit && (
        <div>
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
            ID (code wilaya)
          </label>
          <input
            type="number"
            name="id"
            min={1}
            max={58}
            className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
            placeholder="Ex: 16"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Nom (FR)
          </label>
          <input
            name="nameFr"
            defaultValue={wilaya?.nameFr || ""}
            className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
            placeholder="Alger"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
            الاسم (AR)
          </label>
          <input
            name="nameAr"
            defaultValue={wilaya?.nameAr || ""}
            dir="rtl"
            className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
            placeholder="الجزائر"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Livraison domicile (DA)
          </label>
          <input
            type="number"
            name="shippingHomeFee"
            defaultValue={wilaya?.shippingHomeFee ?? 0}
            min={0}
            step={50}
            className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Livraison relais (DA)
          </label>
          <input
            type="number"
            name="shippingDeskFee"
            defaultValue={wilaya?.shippingDeskFee ?? 0}
            min={0}
            step={50}
            className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={wilaya?.isActive ?? true}
          className="w-4 h-4 rounded border-[#E5E5E5] text-[#FF5722] focus:ring-[#FF5722]/30"
        />
        <span className="text-sm text-neutral-600">Active</span>
      </label>

      {state && typeof state === "string" && (
        <p className="text-xs text-red-500">{state}</p>
      )}

      {state && typeof state === "object" && (
        <ul className="text-xs text-red-500 space-y-0.5">
          {Object.entries(state).map(([key, msgs]) => (
            <li key={key}>{(msgs as string[])[0]}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-6 h-10 rounded-xl bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-colors disabled:opacity-50"
        >
          {pending ? "..." : isEdit ? "Modifier" : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`${ADMIN_BASE}/wilayas`)}
          className="px-6 h-10 rounded-xl border border-[#E5E5E5]/70 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
