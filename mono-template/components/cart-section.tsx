"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/components/cart-context"
import { useLanguage } from "@/components/language-provider"
import { useAdminPrefix } from "@/components/admin-context"
import { localeSafe } from "@/lib/locale-safe"

export function CartSection() {
  const { isOpen, closeCart, items, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart()
  const { locale, isRTL } = useLanguage()
  const pathname = usePathname()
  const adminPrefix = useAdminPrefix()

  if (pathname?.startsWith(adminPrefix)) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white/70 backdrop-blur-2xl border-l border-white/20 shadow-2xl transition-transform duration-400 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-4 border-b border-[#E5E5E5]/60 shrink-0">
          <div className="flex items-center gap-3">
            <h2
              className={`text-lg font-medium text-[#0A0A0A] ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
            >
              {locale === "fr" ? "Votre Panier" : "سلة التسوق"}
            </h2>
            {cartCount > 0 && (
              <span className="text-xs text-neutral-400">
                ({cartCount})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-all"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items or Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF5722]/5 flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <p className={`text-muted-foreground text-sm leading-relaxed ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}>
              {locale === "fr"
                ? "Votre panier est vide. Parcourez notre collection pour ajouter des articles."
                : "سلتك فارغة. تصفح مجموعتنا لإضافة عناصر."}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-[#E5E5E5]/40"
              >
                {/* Product thumbnail */}
                <div className="w-20 h-20 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 bg-[#F5F5F5] shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-1 ring-white/60">
                  <Image
                    src={item.image || item.product.primaryImage || item.product.images[0]}
                    alt=""
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-[#0A0A0A] truncate ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}>
                    {locale === "fr" ? item.product.nameFr : item.product.nameAr}
                  </p>
                  {Object.keys(item.selectionsLabels).length > 0 && (
                    <p className={`text-[11px] text-neutral-500 truncate mt-0.5 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}>
                      {Object.values(item.selectionsLabels).join(", ")}
                    </p>
                  )}
                  <p className="text-[#FF5722] text-xs mt-0.5 font-medium">
                    {localeSafe(item.unitPrice * item.quantity)} {item.product.currency}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-neutral-500 hover:text-[#FF5722] hover:border-[#FF5722]/30 transition-all text-sm"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium text-neutral-700 w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-neutral-500 hover:text-[#FF5722] hover:border-[#FF5722]/30 transition-all text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="shrink-0 text-neutral-300 hover:text-red-400 transition-colors"
                  aria-label="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer total */}
        {items.length > 0 && (
          <div className="shrink-0 px-6 py-5 border-t border-[#E5E5E5]/60 bg-white/40">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm text-neutral-600 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}>
                {locale === "fr" ? "Total" : "المجموع"}
              </span>
              <span className="text-lg font-medium text-[#0A0A0A]">
                {localeSafe(cartTotal)} DA
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-3 rounded-full bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-all text-center"
            >
              {locale === "fr" ? "Commander" : "اطلب الآن"}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
