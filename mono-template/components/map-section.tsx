"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1zNjU4bSEyZTE!2d6.5862099!3d36.382474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f1770077fb4077%3A0x90367569b3d1e626!2sMeuble%20Confiance%20Constantine!5e0!3m2!1sfr!2sdz!4v1"

const OPEN_IN_MAPS_URL =
  "https://www.google.com/maps/place/Meuble+Confiance+Constantine/@36.382474,6.5862099,658m/data=!3m2!1e3!4b1!4m6!3m5!1s0x12f1770077fb4077:0x90367569b3d1e626!8m2!3d36.3824697!4d6.5887848!16s%2Fg%2F11w_y6lckz?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D"

export function MapSection() {
  const { locale, isRTL } = useLanguage()
  const [isMapActive, setIsMapActive] = useState(false)

  return (
    <section className="w-full bg-white py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl md:text-5xl font-light text-[#0A0A0A] ${
              isRTL ? "font-[family-name:var(--font-tajawal)]" : ""
            }`}
          >
            {locale === "fr" ? "Notre Showroom" : "صالة العرض"}
          </h2>
          <div className="w-10 h-[1px] bg-[#FF5722]/40 mx-auto mt-6" />
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Map container — isolate creates a stacking context for z-index layering */}
          <div className="relative isolate w-full max-w-lg rounded-[3rem] md:rounded-full aspect-square overflow-hidden border-4 border-white/20 shadow-2xl shadow-black/10">
            {/* Iframe — z-0, pointer-events-none on mobile until overlay tapped */}
            <iframe
              src={GOOGLE_MAPS_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Meuble Confiance Constantine"
              className={`absolute z-0 origin-center ${
                isMapActive
                  ? "inset-0 w-full h-full pointer-events-auto"
                  : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] pointer-events-none md:inset-0 md:w-full md:h-full md:translate-x-0 md:translate-y-0 md:pointer-events-auto md:scale-[1.75]"
              }`}
            />

            {/* Glassmorphic overlay — z-20, blocks all touch to iframe */}
            <div
              onClick={() => setIsMapActive(true)}
              className={`absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px] cursor-pointer transition-opacity duration-500 ${
                isMapActive
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 pointer-events-auto"
              }`}
            >
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
                  <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v6" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
                <span className="text-xs font-medium text-[#0A0A0A]">
                  {locale === "fr" ? "Appuyez pour interagir" : "اضغط للتفاعل"}
                </span>
              </div>
            </div>
          </div>

          <a
            href={OPEN_IN_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#FF5722]/30 bg-white hover:bg-[#FF5722]/5 text-[#FF5722] text-sm font-medium transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locale === "fr" ? "Open in Google Maps" : "فتح في خرائط Google"}
          </a>
        </div>
      </div>
    </section>
  )
}
