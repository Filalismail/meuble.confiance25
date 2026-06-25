import { CinematicHero } from "@/components/cinematic-hero"
import { OurProductsSection } from "@/components/our-products-section"
import { FaqSection } from "@/components/faq-section"
import { AboutSection } from "@/components/about-section"
import { MapSection } from "@/components/map-section"
import { SocialFooter } from "@/components/social-footer"
import { getSiteSettings } from "@/lib/site-settings"

export const revalidate = 3600

export default async function Home() {
  const settings = await getSiteSettings()
  return (
    <main className="min-h-screen bg-white">
      <div id="top" />
      <CinematicHero />
      <OurProductsSection />
      <FaqSection />
      <AboutSection shopName={settings.shopName} shopNameAr={settings.shopNameAr} />
      <MapSection />
      <SocialFooter />
    </main>
  )
}
