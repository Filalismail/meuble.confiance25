"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useLanguage } from "@/components/language-provider"
import { getCategoryBySlug, getProductsByCategory } from "@/lib/categories"

const ProductQuickView = dynamic(
  () => import("@/components/product-quick-view").then((m) => ({ default: m.ProductQuickView })),
  { ssr: false, loading: () => null },
)
import type { Product, Category } from "@/lib/categories"
import { getPriceRange, getProductMinPrice, getProductMaxPrice } from "@/lib/price-calculator"

type SortMode = "default" | "price-asc" | "price-desc"

function fmt(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function currencySymbol(locale: string) {
  return locale === "ar" ? "\u062F.\u062C" : "DA"
}

export function CategoryPageContent({ slug }: { slug: string }) {
  const { locale, isRTL } = useLanguage()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortMode>("default")
  const [sortOpen, setSortOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getCategoryBySlug(slug),
      getProductsByCategory(slug),
    ]).then(([cat, prods]) => {
      if (cancelled) return
      setCategory(cat ?? null)
      setProducts(prods ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "category_view", metadata: { category_slug: slug } }),
      keepalive: true,
    })
  }, [slug])

  const safeProducts = useMemo(() => products ?? [], [products])

  const { globalMin, globalMax } = useMemo(() => getPriceRange(safeProducts), [safeProducts])
  const [priceFilter, setPriceFilter] = useState(Infinity)
  const clampedPriceFilter = Math.min(priceFilter, globalMax)

  const filtered = useMemo(() => {
    if (safeProducts.length === 0) return []
    let result = safeProducts.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        p.nameFr.toLowerCase().includes(q) ||
        p.nameAr.includes(q)
      if (!matchesSearch) return false
      if (clampedPriceFilter < globalMax) {
        const pMin = getProductMinPrice(p)
        if (pMin > clampedPriceFilter) return false
      }
      return true
    })
    if (sort === "price-asc") result = [...result].sort((a, b) => a.basePrice - b.basePrice)
    if (sort === "price-desc") result = [...result].sort((a, b) => b.basePrice - a.basePrice)
    return result
  }, [safeProducts, search, sort, clampedPriceFilter, globalMax])

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF5722]/30 border-t-[#FF5722] animate-spin" />
          <p className={`text-sm text-neutral-400 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}>
            {locale === "fr" ? "Chargement..." : "جارٍ التحميل..."}
          </p>
        </div>
      </main>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400 text-sm">
          {locale === "fr" ? "Catégorie introuvable" : "الفئة غير موجودة"}
        </p>
      </div>
    )
  }

  const sortOptions: { value: SortMode; labelFr: string; labelAr: string }[] = [
    { value: "default", labelFr: "Recommandé", labelAr: "المقترح" },
    { value: "price-asc", labelFr: "Prix: Bas → Haut", labelAr: "السعر: الأقل → الأعلى" },
    { value: "price-desc", labelFr: "Prix: Haut → Bas", labelAr: "السعر: الأعلى → الأقل" },
  ]

  const handleQuickAdd = (product: Product) => {
    setQuickViewProduct(product)
  }

  const priceRatio = globalMax > globalMin ? (clampedPriceFilter - globalMin) / (globalMax - globalMin) : 1
  const trackFill = `${Math.round(priceRatio * 100)}%`

  const hasNoProducts = safeProducts.length === 0

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-[#F5F5F5]">
        {category.image ? (
          <Image
            src={category.image}
            alt={locale === "fr" ? category.nameFr : category.nameAr}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722]/5 to-neutral-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-6 md:left-12 max-w-xl">
          <span className="text-[#FF5722]/80 text-xs tracking-[0.25em] uppercase font-medium">
            {locale === "fr" ? "Catégorie" : "قسم"}
          </span>
          <h1
            className={`text-3xl md:text-5xl font-light mt-2 text-white ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
          >
            {locale === "fr" ? category.nameFr : category.nameAr}
          </h1>
        </div>
      </section>

      {/* Search & Filter Bar — only show when products exist */}
      {!hasNoProducts && (
        <section className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-[#E5E5E5]/40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-end gap-x-3 gap-y-3">
            {/* Search */}
            <div className="relative w-full sm:flex-1 sm:max-w-xs lg:max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === "fr" ? "Rechercher..." : "بحث..."}
                className={`w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-100 border border-transparent focus:bg-white focus:border-[#FF5722]/30 focus:outline-none text-sm text-neutral-800 placeholder:text-neutral-400 transition-all ${isRTL ? "font-[family-name:var(--font-tajawal)] text-right" : ""}`}
              />
            </div>

            {/* Price Slider */}
            <div className="w-full sm:flex-1 sm:min-w-[180px] sm:max-w-[260px]">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[11px] text-neutral-500 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
                >
                  {locale === "fr" ? "Prix max" : "الحد الأقصى للسعر"}
                </span>
                <span className="text-[11px] font-medium text-[#E64A19]">
                  {fmt(clampedPriceFilter, locale)} {currencySymbol(locale)}
                </span>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-1 rounded-full bg-neutral-200" />
                <div
                  className="absolute left-0 h-1 rounded-full bg-[#FF5722]"
                  style={{ width: trackFill }}
                />
                <input
                  type="range"
                  min={globalMin}
                  max={globalMax}
                value={clampedPriceFilter}
                 onChange={(e) => setPriceFilter(Number(e.target.value))}
                  aria-label={locale === "fr" ? "Filtrer par prix maximum" : "تصفية حسب الحد الأقصى للسعر"}
                  style={{ direction: "ltr" }}
                  className="absolute inset-x-0 w-full h-6 appearance-none bg-transparent cursor-pointer z-10
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-[#FF5722]
                    [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(255,87,34,0.25)]
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:active:scale-110
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-[#FF5722]
                    [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(255,87,34,0.25)]
                    [&::-moz-range-track]:appearance-none
                    [&::-moz-range-track]:bg-transparent"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                aria-label={locale === "fr" ? "Trier les produits" : "ترتيب المنتجات"}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm text-neutral-700 transition-all whitespace-nowrap"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7h18M6 12h12M10 17h4" />
                </svg>
                <span className="hidden sm:inline">
                  {sort === "default"
                    ? locale === "fr" ? "Recommandé" : "المقترح"
                    : sort === "price-asc"
                      ? locale === "fr" ? "Prix: Bas → Haut" : "السعر: الأقل → الأعلى"
                      : locale === "fr" ? "Prix: Haut → Bas" : "السعر: الأعلى → الأقل"}
                </span>
              </button>

              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div
                    className={`absolute top-full mt-2 z-20 min-w-[200px] bg-white rounded-2xl shadow-xl border border-[#E5E5E5] overflow-hidden ${isRTL ? "right-0" : "left-0"}`}
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSort(opt.value)
                          setSortOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-neutral-50 ${
                          sort === opt.value ? "text-[#FF5722] font-medium" : "text-neutral-700"
                        } ${isRTL ? "text-right font-[family-name:var(--font-tajawal)]" : ""}`}
                      >
                        {locale === "fr" ? opt.labelFr : opt.labelAr}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Content Area */}
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        {hasNoProducts ? (
          /* Empty category fallback — fully localized */
          <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FF5722]/5 flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h3
              className={`text-xl md:text-2xl font-medium text-[#0A0A0A] mb-3 ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
            >
              {locale === "fr"
                ? "Aucun produit disponible"
                : "لا توجد منتجات متاحة"}
            </h3>
            <p
              className={`text-sm text-neutral-500 leading-relaxed max-w-md ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
            >
              {locale === "fr"
                ? "Aucun produit disponible dans cette catégorie pour le moment"
                : "عذراً، لا توجد منتجات في هذا القسم حالياً"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* No search/filter results */
          <div className="text-center py-20">
            <p className={`text-neutral-400 text-sm ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}>
              {locale === "fr" ? "Aucun produit trouvé" : "لا توجد منتجات"}
            </p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl overflow-hidden bg-white border border-[#E5E5E5]/60 hover:border-[#FF5722]/20 hover:shadow-lg transition-all duration-400"
              >
                <button
                  onClick={() => setQuickViewProduct(product)}
                  className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer bg-[#F5F5F5]"
                >
                  <Image
                    src={product.primaryImage || product.images[0]}
                    alt={locale === "fr" ? product.nameFr : product.nameAr}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="1.5">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                  </div>
                </button>

                <div className="p-4 md:p-5">
                  <h3
                    className={`text-sm md:text-base font-medium text-[#0A0A0A] ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
                  >
                    {locale === "fr" ? product.nameFr : product.nameAr}
                  </h3>
                  <p className="text-[#E64A19] text-sm mt-1 font-medium">
                    {locale === "fr" ? "À partir de" : "من"}{" "}
                    {fmt(product.basePrice, locale)} {product.currency}
                  </p>

                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="mt-4 w-full py-2.5 rounded-full border border-[#E64A19]/30 text-[#E64A19] text-xs font-medium hover:bg-[#E64A19] hover:text-white transition-all duration-300"
                  >
                    {locale === "fr" ? "Ajouter au panier" : "أضف إلى السلة"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </main>
  )
}
