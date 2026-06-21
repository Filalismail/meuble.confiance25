import { CinematicHero } from "@/components/cinematic-hero"
import { OurProductsSection } from "@/components/our-products-section"
import { FaqSection } from "@/components/faq-section"
import { AboutSection } from "@/components/about-section"
import { MapSection } from "@/components/map-section"
import { SocialFooter } from "@/components/social-footer"
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div id="top" />
      <CinematicHero />
      <OurProductsSection />
      <FaqSection />
      <AboutSection />
      <MapSection />
      <SocialFooter />
    </main>
  )
}
