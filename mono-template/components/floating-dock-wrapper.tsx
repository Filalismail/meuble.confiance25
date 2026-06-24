import { FloatingDock } from "./floating-dock"
import { getSiteSettings } from "@/lib/site-settings"

export async function FloatingDockWrapper() {
  const settings = await getSiteSettings()
  return <FloatingDock whatsappNumber={settings.contactWhatsapp} />
}
