import React from "react"
import type { Metadata } from "next"
import { Inter, Tajawal } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/components/language-provider"
import { CartProvider } from "@/components/cart-context"
import { FloatingDock } from "@/components/floating-dock"
import { CartSection } from "@/components/cart-section"
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

export const metadata: Metadata = {
  title: "مملكة الثقة 25 | Kingdom of Thika 25",
  description:
    "Premium furniture e-commerce based in Constantine, Algeria. Mobilier de luxe, qualité et confiance depuis 2025.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "مملكة الثقة 25 | Kingdom of Thika 25",
    description:
      "Premium furniture e-commerce based in Constantine, Algeria.",
    images: ["/logo.jpg"],
  },
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
        <LanguageProvider>
          <CartProvider>
            <div className="pb-24 md:pb-28">{children}</div>
            <FloatingDock />
            <CartSection />
          </CartProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
