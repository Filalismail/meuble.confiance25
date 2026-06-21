"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import Image from "next/image"
import Link from "next/link"
import { getCategories, type Category } from "@/lib/categories"

const spanMap: Record<number, string> = {
  1: "md:col-span-2 md:row-span-2",
  2: "md:col-span-1 md:row-span-1",
  3: "md:col-span-1 md:row-span-1",
  4: "md:col-span-1 md:row-span-1",
  5: "md:col-span-1 md:row-span-1",
  6: "md:col-span-1 md:row-span-1",
  7: "md:col-span-3 md:row-span-1 md:aspect-[16/9]",
}

export function OurProductsSection() {
  const { locale, isRTL } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data)
    })
  }, [])

  return (
    <section id="products" className="w-full bg-white py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#FF5722] text-xs tracking-[0.25em] uppercase font-medium">
            {locale === "fr" ? "Catégories" : "الأقسام"}
          </span>
          <h2
            className={`text-3xl md:text-5xl font-light mt-3 text-[#0A0A0A] ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
          >
            {locale === "fr" ? "Nos Catégories" : "أنواع منتجاتنا"}
          </h2>
          <div className="w-10 h-[1px] bg-[#FF5722]/40 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {categories.map((cat) => {
            const hasValidImage = cat && typeof cat.image === "string" && cat.image.trim() !== ""

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`group relative ${spanMap[cat.sortOrder] ?? ""} rounded-3xl overflow-hidden cursor-pointer bg-[#F5F5F5] min-h-[180px] md:min-h-[240px] block`}
              >
                {hasValidImage ? (
                  <Image
                    src={cat.image}
                    alt={locale === "fr" ? cat.nameFr : cat.nameAr}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#EAEAEA] flex items-center justify-center text-neutral-400 text-sm font-light">
                    {locale === "fr" ? "Pas d'image disponible" : "لا توجد صورة مضافة"}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-white/80 via-white/40 to-transparent">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm md:text-base font-medium text-[#0A0A0A] ${isRTL ? "font-[family-name:var(--font-tajawal)]" : ""}`}
                    >
                      {locale === "fr" ? cat.nameFr : cat.nameAr}
                    </h3>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#FF5722] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 -translate-x-2 group-hover:translate-x-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}