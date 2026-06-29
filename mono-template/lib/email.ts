import { Resend } from "resend"
import { render } from "@react-email/components"
import { readFileSync } from "fs"
import { join } from "path"
import { OrderConfirmationEmail } from "@/emails/order-confirmation"

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

let cachedLogoSrc: string | null = null

function getLogoSrc(): string {
  if (cachedLogoSrc) return cachedLogoSrc
  try {
    const filePath = join(process.cwd(), "public", "logo.jpg")
    const buffer = readFileSync(filePath)
    const base64 = buffer.toString("base64")
    cachedLogoSrc = `data:image/jpeg;base64,${base64}`
  } catch {
    console.warn("Failed to read logo.jpg — logo will be omitted from email")
    cachedLogoSrc = ""
  }
  return cachedLogoSrc
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 1,
  delayMs: number = 1000,
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      } else {
        console.error(`Email operation failed after ${retries + 1} attempts:`, err)
        return null
      }
    }
  }
  return null
}

export interface SendOrderConfirmationParams {
  email: string
  customerName: string
  orderCode: string
  orderId: string
  productName: string
  purchaseDate: string
}

export async function sendOrderConfirmation(
  params: SendOrderConfirmationParams,
): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured — skipping order confirmation email",
    )
    return
  }

  const logoSrc = getLogoSrc()

  const emailHtml = await render(
    OrderConfirmationEmail({
      customerName: params.customerName,
      orderCode: params.orderCode,
      orderId: params.orderId,
      productName: params.productName,
      purchaseDate: params.purchaseDate,
      logoSrc,
    }),
  )

  await withRetry(async () => {
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: params.email,
      subject: `Confirmation de commande — ${params.orderCode}`,
      html: emailHtml,
    })

    if (error) {
      throw new Error(`Resend returned an error: ${error.message}`)
    }
  })
}
