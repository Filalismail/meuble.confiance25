"use client"

import { useEffect } from "react"
import { ProductContent } from "@/components/product-content"
import type { Product } from "@/lib/categories"

interface Props {
  product: Product
  onClose: () => void
}

export function ProductQuickView({ product, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "product_view", metadata: { product_id: product.id, category_slug: product.categorySlug } }),
      keepalive: true,
    })
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose, product.id, product.categorySlug])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 animate-modal-in"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-all"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <ProductContent product={product} onAdd={onClose} />
      </div>
    </div>
  )
}
