"use client"

import { useEffect } from "react"
import { useLanguage } from "@/components/language-provider"

interface Props {
  onClose: () => void
}

export function SuccessModal({ onClose }: Props) {
  const { locale, isRTL } = useLanguage()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-10 animate-modal-in text-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h2
          className={`text-xl md:text-2xl font-medium text-[#0A0A0A] ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
        >
          {locale === "fr" ? "Commande confirmée !" : "تم تأكيد الطلب!"}
        </h2>
        <p
          className={`text-sm text-neutral-500 mt-3 leading-relaxed ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
        >
          {locale === "fr"
            ? "Merci pour votre commande. Notre équipe vous contactera dans les plus brefs délais pour confirmer les détails et organiser la livraison."
            : "شكراً لطلبك. سيتصل بك فريقنا في أقرب وقت ممكن لتأكيد التفاصيل وترتيب التوصيل."}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-full bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-all"
        >
          {locale === "fr" ? "Continuer mes achats" : "مواصلة التسوق"}
        </button>
      </div>
    </div>
  )
}
