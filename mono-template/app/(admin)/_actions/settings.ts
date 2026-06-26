"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession, mapSupabaseError } from "./_utils"
import { clearSettingsCache } from "@/lib/site-settings"

const UpdateSchema = z.object({
  valueFr: z.string().min(0).default(""),
  valueAr: z.string().min(0).default(""),
})

const CreateSchema = z.object({
  key: z.string().min(1, "La clé est requise").max(100),
  valueFr: z.string().min(0).default(""),
  valueAr: z.string().min(0).default(""),
  description: z.string().min(0).default(""),
})

export async function listSettings() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true })

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function updateSetting(key: string, formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = UpdateSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .update({ value_fr: parsed.data.valueFr, value_ar: parsed.data.valueAr })
    .eq("key", key)

  if (error) return { error: mapSupabaseError(error) }
  clearSettingsCache()
  return { success: true }
}

export async function createSetting(formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = CreateSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .insert({
      key: parsed.data.key,
      value_fr: parsed.data.valueFr,
      value_ar: parsed.data.valueAr,
      description: parsed.data.description,
    })

  if (error) return { error: mapSupabaseError(error) }
  clearSettingsCache()
  return { success: true }
}

export async function deleteSetting(key: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .delete()
    .eq("key", key)

  if (error) return { error: mapSupabaseError(error) }
  clearSettingsCache()
  return { success: true }
}
