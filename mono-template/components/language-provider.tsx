"use client"

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react"

type Locale = "fr" | "ar"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: "ltr" | "rtl"
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getSnapshot(): Locale {
  if (typeof window === "undefined") return "fr" as Locale
  const stored = localStorage.getItem("locale")
  if (stored === "fr" || stored === "ar") return stored as Locale
  return "fr"
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribe, getSnapshot, () => "fr")

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem("locale", newLocale)
    window.dispatchEvent(new Event("storage"))
  }, [])

  const dir = locale === "ar" ? "rtl" : "ltr"
  const isRTL = locale === "ar"

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
