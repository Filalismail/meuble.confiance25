"use client"

import { useLanguage } from "@/components/language-provider"
import { useCart } from "@/components/cart-context"
import { useAdminPrefix } from "@/components/admin-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface NavItem {
  id: string
  label: string
  hash: string
}

const navFr: NavItem[] = [
  { id: "products", hash: "#products", label: "Nos Produits" },
  { id: "faq", hash: "#faq", label: "FAQ" },
  { id: "about", hash: "#about", label: "À Propos" },
]

const navAr: NavItem[] = [
  { id: "products", hash: "#products", label: "منتجاتنا" },
  { id: "faq", hash: "#faq", label: "الأسئلة الشائعة" },
  { id: "about", hash: "#about", label: "من نحن" },
]

interface FloatingDockProps {
  whatsappNumber?: string
}

export function FloatingDock({ whatsappNumber = "213550585884" }: FloatingDockProps) {
  const { locale, isRTL, setLocale } = useLanguage()
  const { toggleCart, cartCount } = useCart()
  const pathname = usePathname()
  const adminPrefix = useAdminPrefix()
  if (pathname?.startsWith(adminPrefix)) return null
  const isHome = pathname === "/"
  const nav = locale === "fr" ? navFr : navAr

  const toggleLanguage = () => {
    setLocale(locale === "fr" ? "ar" : "fr")
  }

  const linkHref = (hash: string) => (isHome ? hash : `/${hash}`)

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[90%] max-w-3xl bg-white/40 backdrop-blur-2xl rounded-full px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/40"
      dir="ltr"
    >
      {/* Logo — Circular */}
      <Link href="/" className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/40">
        <Image
          src="/logo.jpg"
          alt="مملكة الثقة 25"
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Nav Links */}
      <nav
        className={`hidden sm:flex items-center gap-4 lg:gap-6 text-sm font-medium ${
          isRTL ? "font-[family-name:var(--font-tajawal)]" : ""
        }`}
      >
        {nav.map((item) => (
          <Link
            key={item.id}
            href={linkHref(item.hash)}
            className="text-neutral-800 hover:text-[#FF5722] transition-colors duration-200 whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right side: Cart + Language + WhatsApp */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Cart Icon */}
        <button
          onClick={toggleCart}
          className="relative w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-[#FF5722] transition-colors"
          aria-label={locale === "fr" ? "Panier" : "السلة"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF5722] text-white text-[9px] flex items-center justify-center font-bold leading-none">
              {cartCount}
            </span>
          )}
        </button>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/40 bg-white/30 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:border-white/60 transition-all"
        >
          <span
            className={`transition-opacity ${
              locale === "fr" ? "opacity-100 text-[#FF5722]" : "opacity-40"
            }`}
          >
            FR
          </span>
          <span className="text-neutral-300">|</span>
          <span
            className={`transition-opacity ${
              locale === "ar" ? "opacity-100 text-[#FF5722]" : "opacity-40"
            }`}
          >
            AR
          </span>
        </button>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF5722]/40 bg-[#FF5722]/10 hover:bg-[#FF5722]/20 transition-all text-xs text-neutral-800"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse-glow" />
          <span className="hidden sm:inline">Contactez-nous</span>
          <span className="sm:hidden">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  )
}
