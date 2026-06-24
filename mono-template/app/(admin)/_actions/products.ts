"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession } from "./_utils"

const ProductSchema = z.object({
  nameAr: z.string().min(1, "Le nom (AR) est requis"),
  nameFr: z.string().min(1, "Le nom (FR) est requis"),
  descriptionAr: z.string().optional().default(""),
  descriptionFr: z.string().optional().default(""),
  categoryId: z.string().uuid("Catégorie invalide"),
  basePrice: z.number().min(0, "Le prix doit être ≥ 0"),
  primaryImage: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  optionsConfig: z.any().optional().default({}),
})

export async function listProducts() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, categories(slug, name_ar, name_fr)")
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function getProduct(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, categories(slug, name_ar, name_fr)")
    .eq("id", id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function createProduct(raw: unknown) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const parsed = ProductSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Données invalides" }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name_ar: parsed.data.nameAr,
      name_fr: parsed.data.nameFr,
      description_ar: parsed.data.descriptionAr,
      description_fr: parsed.data.descriptionFr,
      category_id: parsed.data.categoryId,
      base_price: parsed.data.basePrice,
      primary_image: parsed.data.primaryImage,
      images: parsed.data.images,
      is_featured: parsed.data.isFeatured,
      options_config: parsed.data.optionsConfig,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateProduct(id: string, raw: unknown) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const parsed = ProductSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Données invalides" }

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name_ar: parsed.data.nameAr,
      name_fr: parsed.data.nameFr,
      description_ar: parsed.data.descriptionAr,
      description_fr: parsed.data.descriptionFr,
      category_id: parsed.data.categoryId,
      base_price: parsed.data.basePrice,
      primary_image: parsed.data.primaryImage,
      images: parsed.data.images,
      is_featured: parsed.data.isFeatured,
      options_config: parsed.data.optionsConfig,
    })
    .eq("id", id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}
