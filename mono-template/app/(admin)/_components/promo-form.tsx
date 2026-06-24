"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { createPromo, updatePromo } from "../_actions/promos"

interface Props {
  promo?: {
    id: string
    code: string
    discountPercentage: number
    isActive: boolean
    maxUses: number
    currentUses: number
  }
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function PromoForm({ promo }: Props) {
  const router = useRouter()
  const isEdit = !!promo

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = isEdit
        ? await updatePromo(promo.id, formData)
        : await createPromo(formData)
      if (result.error) return result.error
      router.push(`${ADMIN_BASE}/promos`)
      return null
    },
    null,
  )

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
          Code promo
        </label>
        <input
          name="code"
          defaultValue={promo?.code || ""}
          className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors uppercase"
          placeholder="EX: PROMO10"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
          Réduction (%)
        </label>
        <input
          type="number"
          name="discountPercentage"
          defaultValue={promo?.discountPercentage || 10}
          min={1}
          max={100}
          className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
          Utilisations max
        </label>
        <input
          type="number"
          name="maxUses"
          defaultValue={promo?.maxUses || 1}
          min={1}
          className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
        />
        {promo && (
          <p className="text-[11px] text-neutral-400 mt-1">
            Utilisé {promo.currentUses} fois
          </p>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={promo?.isActive ?? true}
          className="w-4 h-4 rounded border-[#E5E5E5] text-[#FF5722] focus:ring-[#FF5722]/30"
        />
        <span className="text-sm text-neutral-600">Actif</span>
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
          onClick={() => router.push(`${ADMIN_BASE}/promos`)}
          className="px-6 h-10 rounded-xl border border-[#E5E5E5]/70 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
