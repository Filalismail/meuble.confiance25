"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { useAdminPrefix } from "@/components/admin-context"

export function PrivacyBanner() {
  const pathname = usePathname()
  const { locale, isRTL } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const adminPrefix = useAdminPrefix()
  const isAdmin = pathname.startsWith(adminPrefix)

  useEffect(() => {
    const hasConsented = localStorage.getItem("thika25_privacy_consent")
    if (!hasConsented) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.setItem("thika25_privacy_consent", "true")
    setIsVisible(false)
  }, [])

  if (isAdmin || !isVisible) return null

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-5"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <p
        className={`text-xs text-neutral-600 leading-relaxed ${
          isRTL ? "font-[family-name:var(--font-tajawal)] text-right" : ""
        }`}
      >
        {locale === "fr"
          ? "Nous utilisons des données de navigation anonymes pour améliorer votre expérience sur notre boutique. Nous ne stockons aucune donnée personnelle."
          : "نحن نستخدم بيانات التصفح لتقديم تجربة مستخدم أفضل وأسرع. موقعنا لا يقوم بتخزين أي بيانات شخصية."}
      </p>
      <button
        onClick={handleDismiss}
        className="mt-3 text-xs font-medium text-[#FF5722] hover:text-[#FF5722]/80 transition-colors"
      >
        Compris / مفهوم
      </button>
    </div>
  )
}
