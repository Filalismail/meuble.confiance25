import React from "react"
import type { Metadata } from "next"
import { Inter, Tajawal } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/components/language-provider"
import { CartProvider } from "@/components/cart-context"
import { FloatingDockWrapper } from "@/components/floating-dock-wrapper"
import { CartSection } from "@/components/cart-section"
import { PrivacyBanner } from "@/components/privacy-banner"
import { VisitTracker } from "@/components/visit-tracker"
import { AdminPrefixProvider } from "@/components/admin-context"
import { ADMIN_PREFIX } from "@/lib/admin-config"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
})

import { getSiteSettings } from "@/lib/site-settings"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = `${settings.shopNameAr} | ${settings.shopName}`
  return {
    title,
    description: `${settings.shopTagline}. Premium furniture e-commerce based in Constantine, Algeria.`,
    icons: {
      icon: "/favicon.ico",
      apple: "/logo.jpg",
    },
    openGraph: {
      title,
      description: settings.shopTagline,
      images: ["/logo.jpg"],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${tajawal.variable} font-sans antialiased`}
      >
        <AdminPrefixProvider prefix={ADMIN_PREFIX}>
          <LanguageProvider>
            <CartProvider>
              <div className="pb-24 md:pb-28">{children}</div>
              <FloatingDockWrapper />
              <CartSection />
              <PrivacyBanner />
            </CartProvider>
          </LanguageProvider>
        </AdminPrefixProvider>
        <Analytics />
        <VisitTracker />
      </body>
    </html>
  )
}
