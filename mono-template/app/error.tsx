"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Page error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-lg font-medium text-[#0A0A0A] mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-neutral-500 mb-6">Veuillez réessayer ou rafraîchir la page.</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-all"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
