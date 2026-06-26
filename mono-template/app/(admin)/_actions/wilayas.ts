"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession, mapSupabaseError } from "./_utils"

const WilayaSchema = z.object({
  id: z.coerce.number().int().min(1).max(58).optional(),
  nameAr: z.string().min(1, "Requis"),
  nameFr: z.string().min(1, "Requis"),
  shippingHomeFee: z.coerce.number().min(0).catch(0),
  shippingDeskFee: z.coerce.number().min(0).catch(0),
  isActive: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
})

export async function listWilayas() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("wilayas")
    .select("*")
    .order("id", { ascending: true })

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function getWilaya(id: number) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("wilayas")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function createWilaya(formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = WilayaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  if (!parsed.data.id) return { error: { id: ["ID requis"] } }

  const { data, error } = await supabaseAdmin
    .from("wilayas")
    .insert({
      id: parsed.data.id,
      name_ar: parsed.data.nameAr,
      name_fr: parsed.data.nameFr,
      shipping_home_fee: parsed.data.shippingHomeFee,
      shipping_desk_fee: parsed.data.shippingDeskFee,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function updateWilaya(id: number, formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = WilayaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabaseAdmin
    .from("wilayas")
    .update({
      name_ar: parsed.data.nameAr,
      name_fr: parsed.data.nameFr,
      shipping_home_fee: parsed.data.shippingHomeFee,
      shipping_desk_fee: parsed.data.shippingDeskFee,
      is_active: parsed.data.isActive,
    })
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}

export async function deleteWilaya(id: number) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin
    .from("wilayas")
    .delete()
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}
