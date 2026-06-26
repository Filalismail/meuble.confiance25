"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession, mapSupabaseError } from "./_utils"

const CategorySchema = z.object({
  nameAr: z.string().min(1, "Le nom (AR) est requis"),
  nameFr: z.string().min(1, "Le nom (FR) est requis"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"),
  image: z.string().optional().default(""),
  gradient: z.string().optional().default("from-[#F5F0EB] to-[#E8DFD3]"),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
})

export async function listCategories() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order")

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function getCategory(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function createCategory(raw: unknown) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const parsed = CategorySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Données invalides" }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      name_ar: parsed.data.nameAr,
      name_fr: parsed.data.nameFr,
      slug: parsed.data.slug,
      image: parsed.data.image,
      gradient: parsed.data.gradient,
      is_active: parsed.data.isActive,
      sort_order: parsed.data.sortOrder,
    })
    .select("id")
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function updateCategory(id: string, raw: unknown) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const parsed = CategorySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Données invalides" }

  const { error } = await supabaseAdmin
    .from("categories")
    .update({
      name_ar: parsed.data.nameAr,
      name_fr: parsed.data.nameFr,
      slug: parsed.data.slug,
      image: parsed.data.image,
      gradient: parsed.data.gradient,
      is_active: parsed.data.isActive,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}

export async function deleteCategory(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id)
  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}

const ProductOrderSchema = z.array(
  z.object({ id: z.string().uuid(), sortOrder: z.number().int().min(0) }),
)

export async function batchUpdateProductOrder(items: { id: string; sortOrder: number }[]) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const parsed = ProductOrderSchema.safeParse(items)
  if (!parsed.success) return { error: "Données invalides" }

  for (const item of parsed.data) {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ sort_order: item.sortOrder })
      .eq("id", item.id)
    if (error) return { error: mapSupabaseError(error) }
  }

  return { success: true }
}
