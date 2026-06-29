import { Resend } from "resend"
import { render } from "@react-email/components"
import { OrderConfirmationEmail } from "@/emails/order-confirmation"

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
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

  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/logo.jpg`

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
