import { supabaseAdmin } from "./supabase-admin"

export interface SiteSettingsMap {
  shopName: string
  shopNameAr: string
  shopTagline: string
  shopTaglineAr: string
  contactPhone: string
  contactWhatsapp: string
  deliveryThreshold: number
  deliveryThresholdLabelFr: string
  deliveryThresholdLabelAr: string
}

let cached: SiteSettingsMap | null = null

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  if (cached) return cached

  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("key, value_fr, value_ar")

  const map: Record<string, { fr: string; ar: string }> = {}
  for (const row of data || []) {
    map[row.key] = { fr: row.value_fr, ar: row.value_ar }
  }

  cached = {
    shopName: map.shop_name?.fr || "Thika 25",
    shopNameAr: map.shop_name?.ar || "ثقة 25",
    shopTagline: map.shop_tagline?.fr || "Ameublement de luxe pour la maison moderne",
    shopTaglineAr: map.shop_tagline?.ar || "أثاث فاخر للمنزل العصري",
    contactPhone: map.contact_phone?.fr || "",
    contactWhatsapp: map.contact_whatsapp?.fr || "213550585884",
    deliveryThreshold: Number(map.delivery_threshold?.fr) || 50000,
    deliveryThresholdLabelFr:
      map.delivery_threshold_label_ar?.fr || "Livraison gratuite dès 50 000 DA",
    deliveryThresholdLabelAr:
      map.delivery_threshold_label_ar?.ar || "توصيل مجاني للطلبات فوق 50,000 د.ج",
  }

  return cached
}

export function clearSettingsCache() {
  cached = null
}
