import { CheckoutPageContent } from "@/components/checkout-page-content"
import { getSiteSettings } from "@/lib/site-settings"

export const revalidate = 3600

export default async function CheckoutPage() {
  const settings = await getSiteSettings()

  return (
    <CheckoutPageContent
      deliveryThreshold={settings.deliveryThreshold}
      deliveryThresholdLabelFr={settings.deliveryThresholdLabelFr}
      deliveryThresholdLabelAr={settings.deliveryThresholdLabelAr}
    />
  )
}
