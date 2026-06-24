"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession } from "./_utils"

const PromoSchema = z.object({
  code: z.string().min(1, "Requis").max(50).toUpperCase(),
  discountPercentage: z.coerce.number().int().min(1).max(100),
  isActive: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  maxUses: z.coerce.number().int().min(1).default(1),
})

export async function listPromos() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function getPromo(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function createPromo(formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = PromoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .insert({
      code: parsed.data.code,
      discount_percentage: parsed.data.discountPercentage,
      is_active: parsed.data.isActive,
      max_uses: parsed.data.maxUses,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updatePromo(id: string, formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = PromoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabaseAdmin
    .from("promo_codes")
    .update({
      code: parsed.data.code,
      discount_percentage: parsed.data.discountPercentage,
      is_active: parsed.data.isActive,
      max_uses: parsed.data.maxUses,
    })
    .eq("id", id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deletePromo(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin
    .from("promo_codes")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  return { success: true }
}
