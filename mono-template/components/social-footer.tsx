"use client"

import { useLanguage } from "@/components/language-provider"

export function SocialFooter() {
  const { locale } = useLanguage()

  return (
    <footer className="w-full bg-white border-t border-[#E5E5E5] py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        {/* Social Icons */}
        <div className="flex items-center gap-6">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/meuble.confiance.constantine/"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#FF5722] hover:border-[#FF5722]/30 transition-all duration-300"
            aria-label="Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/people/%D9%85%D9%85%D9%84%D9%83%D8%A9-%D8%A3%D8%AB%D8%A7%D8%AB-%D8%A7%D9%84%D8%AB%D9%82%D8%A9-%D9%82%D8%B3%D9%86%D8%B7%D9%8A%D9%86%D8%A9/61575192416329/"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#FF5722] hover:border-[#FF5722]/30 transition-all duration-300"
            aria-label="Facebook"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>

          {/* TikTok (custom SVG) */}
          <a
            href="https://www.tiktok.com/@meuble.confiance25"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#FF5722] hover:border-[#FF5722]/30 transition-all duration-300"
            aria-label="TikTok"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 4 15.68a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.74a8.24 8.24 0 0 0 4.91 1.57v-3.4a4.83 4.83 0 0 1-2-.22z" />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground tracking-wide">
          &copy; {new Date().getFullYear()} مملكة الثقة 25 &mdash;{" "}
          {locale === "fr"
            ? "Meuble Confiance Constantine"
            : "مملكة أثاث الثقة قسنطينة"}
        </p>
      </div>
    </footer>
  )
}
