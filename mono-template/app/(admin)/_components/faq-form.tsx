"use client"

import { useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import { createFaq, updateFaq } from "../_actions/faqs"

interface Props {
  faq?: {
    id: string
    questionAr: string
    questionFr: string
    answerAr: string
    answerFr: string
    sortOrder: number
    isActive: boolean
  }
}

const ADMIN_BASE = "/afa5e04feb3266f1"
const tabs = [
  { key: "fr", label: "Français" },
  { key: "ar", label: "العربية" },
]

export function FaqForm({ faq }: Props) {
  const router = useRouter()
  const isEdit = !!faq
  const [tab, setTab] = useState<"fr" | "ar">("fr")

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = isEdit
        ? await updateFaq(faq.id, formData)
        : await createFaq(formData)
      if (result.error) return result.error
      router.push(`${ADMIN_BASE}/faqs`)
      return null
    },
    null,
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100/60 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as "fr" | "ar")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-[#0A0A0A] shadow-sm"
                : "text-neutral-500 hover:text-[#0A0A0A]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "fr" ? "block" : "hidden"}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
              Question (FR)
            </label>
            <input
              name="questionFr"
              defaultValue={faq?.questionFr || ""}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
              placeholder="Question en français"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
              Réponse (FR)
            </label>
            <textarea
              name="answerFr"
              defaultValue={faq?.answerFr || ""}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors resize-y"
              placeholder="Réponse en français"
            />
          </div>
        </div>
      </div>

      <div className={tab === "ar" ? "block" : "hidden"} dir="rtl">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
              السؤال (AR)
            </label>
            <input
              name="questionAr"
              defaultValue={faq?.questionAr || ""}
              className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
              placeholder="السؤال بالعربية"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
              الإجابة (AR)
            </label>
            <textarea
              name="answerAr"
              defaultValue={faq?.answerAr || ""}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors resize-y"
              placeholder="الإجابة بالعربية"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Ordre
          </label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={faq?.sortOrder ?? 0}
            min={0}
            className="w-20 h-10 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-6">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={faq?.isActive ?? true}
            className="w-4 h-4 rounded border-[#E5E5E5] text-[#FF5722] focus:ring-[#FF5722]/30"
          />
          <span className="text-sm text-neutral-600">Actif</span>
        </label>
      </div>

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
          onClick={() => router.push(`${ADMIN_BASE}/faqs`)}
          className="px-6 h-10 rounded-xl border border-[#E5E5E5]/70 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
