"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { after } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { trackServerEvent, extractClientHeaders } from "@/lib/analytics"
import { getSiteSettings } from "@/lib/site-settings"

// ── Zod Schemas ──────────────────────────────────────────────

const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  selections: z.record(z.string()),
  quantity: z.number().int().min(1).max(100),
})

const SubmitOrderPayloadSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(50),
  firstName: z
    .string()
    .min(1, "Prénom requis")
    .max(100)
    .regex(/^[a-zA-Z\u0600-\u06FF\s-]+$/, "Caractères invalides"),
  lastName: z
    .string()
    .min(1, "Nom requis")
    .max(100)
    .regex(/^[a-zA-Z\u0600-\u06FF\s-]+$/, "Caractères invalides"),
  phone: z
    .string()
    .regex(/^0[567][0-9]{8}$/, "Numéro de téléphone invalide"),
  wilayaId: z.number().int().min(1).max(58),
  deliveryType: z.enum(["home", "desk"]),
  note: z
    .string()
    .max(500)
    .regex(/^[a-zA-Z\u0600-\u06FF0-9\s.,!?()\-_@/:]*$/, "Caractères invalides")
    .default(""),
  promoCode: z.string().max(20).regex(/^[a-zA-Z0-9_-]*$/).default(""),
})

// ── Types ───────────────────────────────────────────────────

interface SubmitOrderResult {
  success: boolean
  error?: string
}

// ── Server Action ────────────────────────────────────────────

export async function submitOrder(
  prevState: SubmitOrderResult | null,
  formData: FormData,
): Promise<SubmitOrderResult> {
  try {
    // ── 1. Extract client IP ────────────────────────────────
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown"

    // ── 2. Check IP rate limit (skipped in development) ──
    if (process.env.NODE_ENV !== "development") {
      const { data: rateLimitResult, error: rateLimitErr } =
        await supabaseAdmin.rpc("check_ip_rate_limit", {
          p_ip: clientIp,
          p_window_seconds: 300,
          p_max_requests: 10,
        })

      if (rateLimitErr) {
        console.error("Rate limit RPC error:", rateLimitErr)
        return { success: false, error: "Erreur de validation" }
      }

      if (!rateLimitResult) {
        console.warn("Rate limit RPC returned null data, allowing request:", clientIp)
      } else if (!rateLimitResult.allowed) {
        console.warn("Rate limit hit for IP:", clientIp)
        return {
          success: false,
          error:
            "Trop de tentatives. Veuillez attendre 5 minutes avant de réessayer.",
        }
      }
    }

    // ── 3. Parse + validate payload with Zod ────────────────
    const raw = formData.get("payload")
    if (!raw || typeof raw !== "string") {
      return { success: false, error: "Données invalides" }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { success: false, error: "Format JSON invalide" }
    }

    const validation = SubmitOrderPayloadSchema.safeParse(parsed)
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? "Données invalides",
      }
    }

    const {
      items,
      firstName,
      lastName,
      phone,
      wilayaId,
      deliveryType,
      note,
      promoCode,
    } = validation.data

    // ── 4. Fetch all products from DB ───────────────────────
    const productIds = [...new Set(items.map((i) => i.productId))]
    const { data: dbProducts, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name_ar, name_fr, base_price, options_config")
      .in("id", productIds)

    if (prodErr || !dbProducts || dbProducts.length !== productIds.length) {
      return { success: false, error: "Produits introuvables" }
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // ── 5. Re-compute prices server-side ───────────────────
    const itemsJson: Array<{
      product_id: string
      name_fr: string
      name_ar: string
      selections: Record<string, string>
      unit_price: number
      quantity: number
      subtotal: number
    }> = []

    let subtotal = 0

    for (const item of items) {
      const dbProduct = productMap.get(item.productId)
      if (!dbProduct) {
        return {
          success: false,
          error: `Produit ${item.productId} introuvable`,
        }
      }

      const basePrice = Number(dbProduct.base_price)
      const optionsConfig = dbProduct.options_config ?? {}

      let addon = 0
      for (const [groupKey, selectedValue] of Object.entries(item.selections)) {
        const group = optionsConfig[groupKey]
        if (!group) continue
        const entry = group.options.find(
          (opt: {
            val?: string
            name_fr?: string
            name_ar?: string
          }) => (opt.val ?? opt.name_fr ?? opt.name_ar ?? "") === selectedValue,
        )
        if (entry) addon += entry.price_addon
      }

      const unitPrice = basePrice + addon
      const lineSubtotal = unitPrice * item.quantity
      subtotal += lineSubtotal

      itemsJson.push({
        product_id: item.productId,
        name_fr: dbProduct.name_fr,
        name_ar: dbProduct.name_ar,
        selections: item.selections,
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal,
      })
    }

    // ── 5b. Prevent promo code reuse per phone number ──
    if (promoCode) {
      const digits = phone.replace(/\D/g, "")
      const normalized = digits.length >= 9 ? "0" + digits.slice(-9) : digits
      if (normalized.length < 10) {
        return { success: false, error: "Numéro de téléphone invalide" }
      }
      const { count } = await supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("phone_number", normalized)
        .eq("promo_code", promoCode)
        .not("status", "eq", "cancelled")

      if (count && count > 0) {
        return {
          success: false,
          error: "Ce numéro de téléphone a déjà utilisé ce code promo.",
        }
      }
    }

    // ── 6. Apply promo code (FOR UPDATE row lock) ──────────
    let discount = 0
    if (promoCode) {
      const { data: promoResult, error: promoErr } = await supabaseAdmin.rpc(
        "apply_promo_code",
        {
          p_code: promoCode,
          p_subtotal: subtotal,
        },
      )

      if (promoErr) {
        console.error("Promo RPC error:", promoErr)
        return {
          success: false,
          error: "Erreur lors de l'application du code promo",
        }
      }

      if (!promoResult?.valid) {
        return {
          success: false,
          error: promoResult?.error ?? "Code promo invalide",
        }
      }

      discount = promoResult.discount_amount ?? 0
    }

    // ── 7. Verify wilaya and get delivery fee ──────────────
    const { data: wilaya } = await supabaseAdmin
      .from("wilayas")
      .select("shipping_home_fee, shipping_desk_fee")
      .eq("id", wilayaId)
      .eq("is_active", true)
      .single()

    if (!wilaya) {
      return { success: false, error: "Wilaya invalide" }
    }

    let deliveryFee =
      deliveryType === "home"
        ? Number(wilaya.shipping_home_fee)
        : Number(wilaya.shipping_desk_fee)

    const settings = await getSiteSettings()
    if (subtotal >= settings.deliveryThreshold) {
      deliveryFee = 0
    }

    const finalTotal = subtotal - discount + deliveryFee

    // ── 8. Insert order ────────────────────────────────────
    const { error: insertErr } = await supabaseAdmin.from("orders").insert({
      customer_first_name: firstName,
      customer_last_name: lastName,
      phone_number: phone,
      wilaya_id: wilayaId,
      delivery_type: deliveryType,
      order_note: note,
      items_json: itemsJson,
      subtotal,
      discount_applied: discount,
      delivery_fee: deliveryFee,
      final_total: finalTotal,
      status: "pending",
      promo_code: promoCode || "",
    })

    if (insertErr) {
      console.error("Order insert error:", insertErr)
      return {
        success: false,
        error: "Erreur lors de la création de la commande",
      }
    }

    // ── 9. Extract analytics source ────────────────────────
    const { source } = extractClientHeaders(headersList, undefined)

    // ── 10. Fire-and-forget analytics ─────────────────────
    after(async () => {
      await trackServerEvent(
        "checkout_success",
        {
          wilaya_id: wilayaId,
          shipping_type: deliveryType,
          cart_value: finalTotal,
          discount_applied: discount,
          items_json: itemsJson.slice(0, 50),
          source,
        },
        clientIp,
        headersList.get("user-agent") ?? "unknown",
      )
    })

    return { success: true }
  } catch (err) {
    console.error("submitOrder unexpected error:", err)
    return { success: false, error: "Erreur serveur" }
  }
}

// ── Promo Code Validation (server-side, no anon key exposure) ──

export interface CheckPromoResult {
  valid: boolean
  discountPercentage?: number
  message: string
}

export async function checkPromoCode(
  code: string,
  subtotal: number,
): Promise<CheckPromoResult> {
  try {
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("discount_percentage, is_active, current_uses, max_uses")
      .eq("code", code)
      .single()

    if (error || !data) {
      return { valid: false, message: "Code promo introuvable" }
    }

    if (!data.is_active) {
      return { valid: false, message: "Code promo désactivé" }
    }

    if (data.current_uses >= data.max_uses) {
      return { valid: false, message: "Code promo déjà épuisé" }
    }

    return {
      valid: true,
      discountPercentage: data.discount_percentage,
      message: "",
    }
  } catch {
    return { valid: false, message: "Erreur serveur" }
  }
}
