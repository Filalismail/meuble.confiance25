"use client"

import { useLanguage } from "@/components/language-provider"
import Image from "next/image"

interface AboutSectionProps {
  shopName?: string
  shopNameAr?: string
}

export function AboutSection({ shopName = "Thika 25", shopNameAr = "ثقة 25" }: AboutSectionProps) {
  const { locale, isRTL } = useLanguage()

  return (
    <section
      id="about"
      className="w-full bg-[#FAFAFA] py-24 md:py-32 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#FF5722] text-xs tracking-[0.25em] uppercase font-medium">
            {locale === "fr" ? "Notre Histoire" : "قصتنا"}
          </span>
          <h2
            className={`text-3xl md:text-5xl font-light mt-3 text-[#0A0A0A] ${
              isRTL ? "font-[family-name:var(--font-tajawal)]" : ""
            }`}
          >
            {locale === "fr" ? "À Propos" : "من نحن"}
          </h2>
          <div className="w-10 h-[1px] bg-[#FF5722]/40 mx-auto mt-6" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="shrink-0">
            <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden bg-white border border-slate-100 shadow-lg">
              <Image
                src="/logo.jpg"
                alt="مملكة الثقة 25"
                fill
                sizes="160px"
                className="object-contain p-3"
              />
            </div>
          </div>
          <div
            className={`flex-1 ${
              isRTL ? "font-[family-name:var(--font-tajawal)] text-right" : ""
            }`}
          >
            <p className="text-muted-foreground text-sm leading-relaxed md:text-base md:leading-relaxed">
              {locale === "fr"
                ? `Basée à Constantine, مملكة ${shopNameAr} (Kingdom of ${shopName}) est une destination premium pour l'ameublement de luxe. Depuis 2025, nous sélectionnons des pièces d'exception alliant artisanat traditionnel et design contemporain. Chaque meuble raconte une histoire de qualité, de confiance et d'élégance intemporelle.`
                : `مقرها في قسنطينة، مملكة ${shopNameAr} هي وجهة متميزة للأثاث الفاخر. منذ عام 2025، نختار قطعاً استثنائية تجمع بين الحرفية التقليدية والتصميم المعاصر. كل قطعة أثاث تحكي قصة الجودة والثقة والأناقة الخالدة.`}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-8 h-[1px] bg-[#FF5722]/40" />
              <span className="text-[#FF5722] text-xs tracking-[0.2em] uppercase font-medium">
                {locale === "fr" ? "Depuis 2025" : "منذ 2025"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
