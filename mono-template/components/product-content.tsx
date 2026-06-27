"use client"

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { useCart } from "@/components/cart-context"
import type { Product } from "@/lib/categories"
import {
  computeUnitPrice,
  getGroupLabel,
  getOptionLabel,
  getOptionValue,
  getDefaultSelections,
  getSelectionsLabels,
  getProductMinPrice,
  getProductMaxPrice,
} from "@/lib/price-calculator"

function fmt(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function currencySymbol(locale: string) {
  return locale === "ar" ? "\u062F.\u062C" : "DA"
}

interface Props {
  product: Product
  onAdd?: () => void
}

export function ProductContent({ product, onAdd }: Props) {
  const { locale, isRTL } = useLanguage()
  const { addToCart, openCart } = useCart()
  const [imgIndex, setImgIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const defaultSelections = useMemo(() => getDefaultSelections(product), [product])
  const [selections, setSelections] = useState<Record<string, string>>(defaultSelections)

  const configKeys = useMemo(() => Object.keys(product.optionsConfig), [product.optionsConfig])
  const optionsGroups = useMemo(() => Object.values(product.optionsConfig), [product.optionsConfig])

  const minPrice = useMemo(() => getProductMinPrice(product), [product])
  const maxPrice = useMemo(() => getProductMaxPrice(product), [product])

  const unitPrice = useMemo(
    () => computeUnitPrice(product, selections),
    [product, selections],
  )

  const galleryImages = useMemo(
    () =>
      product.images.length > 0
        ? product.images
        : product.primaryImage
          ? [product.primaryImage]
          : [],
    [product.images, product.primaryImage],
  )

  const prevImage = useCallback(() => {
    setImgIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1))
  }, [galleryImages.length])

  const nextImage = useCallback(() => {
    setImgIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1))
  }, [galleryImages.length])

  const handleSelectionChange = (groupKey: string, value: string) => {
    setSelections((prev) => ({ ...prev, [groupKey]: value }))
    const key = groupKey === "dimensions" || groupKey === "taille" ? "size_viewed" : "color_viewed"
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "product_view", metadata: { product_id: product.id, [key]: value } }),
      keepalive: true,
    })
  }

  const handleAdd = () => {
    const labels = getSelectionsLabels(product, selections, locale)
    addToCart(
      product,
      quantity,
      selections,
      labels,
      unitPrice,
      galleryImages[imgIndex],
    )
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "add_to_cart", metadata: { product_id: product.id, quantity, unit_price: unitPrice, option_selections: selections } }),
      keepalive: true,
    })
    openCart()
    onAdd?.()
  }

  const isDefaultPrice = unitPrice === computeUnitPrice(product, defaultSelections)

  return (
    <div
      className="flex flex-col md:flex-row"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Left — Image Gallery */}
      <div className="relative w-full md:w-[55%] aspect-square md:aspect-auto md:min-h-[500px] bg-[#F5F5F5] rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden shrink-0">
        {galleryImages.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-400 ${
              idx === imgIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </div>
        ))}

        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/60 backdrop-blur flex items-center justify-center text-neutral-700 hover:bg-white hover:text-[#FF5722] transition-all shadow-lg z-10"
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/60 backdrop-blur flex items-center justify-center text-neutral-700 hover:bg-white hover:text-[#FF5722] transition-all shadow-lg z-10"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === imgIndex ? "bg-[#FF5722] w-4" : "bg-white/60 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right — Details */}
      <div className="flex-1 flex flex-col p-6 md:p-8 md:py-10">
        <div className="flex-1">
          {/* Title */}
          <h2
            className={`text-xl md:text-2xl font-medium text-[#0A0A0A] ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
          >
            {locale === "fr" ? product.nameFr : product.nameAr}
          </h2>

          {/* Live price */}
          <p className="text-[#FF5722] text-2xl font-medium mt-3">
            {fmt(unitPrice, locale)} {currencySymbol(locale)}
          </p>
          {isDefaultPrice && minPrice < maxPrice && (
            <p
              className={`text-[11px] text-neutral-400 mt-0.5 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
            >
              {locale === "fr"
                ? `Prix de départ. Maximum: ${fmt(maxPrice, locale)} ${currencySymbol(locale)}`
                : `سعر البداية. الحد الأقصى: ${fmt(maxPrice, locale)} ${currencySymbol(locale)}`}
            </p>
          )}

          {/* Description */}
          <p
            className={`text-sm text-neutral-500 leading-relaxed mt-4 border-t border-[#E5E5E5]/40 pt-4 ${
              isRTL ? "font-[family-name:var(--font-tajawal)]" : ""
            }`}
          >
            {locale === "fr" ? product.descriptionFr : product.descriptionAr}
          </p>

          {/* Dynamic Attribute Dropdowns */}
          <div className="mt-6 space-y-4">
            {configKeys.map((groupKey) => {
              const group = product.optionsConfig[groupKey]
              if (!group) return null
              return (
                <div key={groupKey}>
                  <label
                    className={`block text-xs text-neutral-500 mb-1.5 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
                  >
                    {getGroupLabel(group, locale)}
                  </label>
                  <select
                    value={selections[groupKey] ?? ""}
                    onChange={(e) => handleSelectionChange(groupKey, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm text-neutral-800 focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20 transition-all appearance-none ${
                      isRTL ? "font-[family-name:var(--font-tajawal)]" : ""
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.25rem",
                    }}
                  >
                    {group.options.map((entry) => (
                      <option
                        key={getOptionValue(group, entry)}
                        value={getOptionValue(group, entry)}
                      >
                        {getOptionLabel(group, entry, locale)}
                        {entry.price_addon > 0
                          ? ` (+${fmt(entry.price_addon, locale)} ${currencySymbol(locale)})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom — Quantity + Add to Cart */}
        <div className="mt-6 pt-6 border-t border-[#E5E5E5]/40 flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-100 rounded-full px-1.5 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white hover:text-[#FF5722] transition-all text-lg font-medium"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium text-neutral-800 select-none">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white hover:text-[#FF5722] transition-all text-lg font-medium"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3.5 rounded-full bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-all duration-300 shadow-[0_4px_20px_rgba(255,87,34,0.25)]"
          >
            {locale === "fr" ? "Ajouter au panier" : "أضف إلى السلة"}
          </button>
        </div>
      </div>
    </div>
  )
}
