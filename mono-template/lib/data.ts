import { supabase } from "@/lib/supabase"
import type { Product, Category, Wilaya, PromoCode, Faq, OptionsGroupEntry } from "@/lib/types"

function mapProduct(row: any, categorySlug: string): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    nameAr: row.name_ar,
    nameFr: row.name_fr,
    slug: row.slug ?? "",
    descriptionAr: row.description_ar,
    descriptionFr: row.description_fr,
    primaryImage: row.primary_image,
    images: row.images ?? [],
    isFeatured: row.is_featured ?? false,
    basePrice: Number(row.base_price),
    currency: "DA",
    categorySlug,
    sortOrder: row.sort_order ?? 0,
    optionsConfig: row.options_config ?? {},
  }
}

function mapCategory(row: any): Category {
  return {
    id: row.id,
    slug: row.slug,
    nameAr: row.name_ar,
    nameFr: row.name_fr,
    image: row.image ?? "",
    gradient: row.gradient ?? "from-[#F5F0EB] to-[#E8DFD3]",
    isActive: row.is_active ?? true,
    sortOrder: row.sort_order ?? 0,
  }
}

function mapWilaya(row: any): Wilaya {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameFr: row.name_fr,
    shippingHomeFee: Number(row.shipping_home_fee),
    shippingDeskFee: Number(row.shipping_desk_fee),
    isActive: row.is_active ?? true,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_ar, name_fr, image, gradient, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error || !data) return []
  return data.map(mapCategory)
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_ar, name_fr, image, gradient, is_active, sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null
  return mapCategory(data)
}

export async function fetchProductsByCategorySlug(slug: string): Promise<Product[]> {
  const category = await fetchCategoryBySlug(slug)
  if (!category) return []

  const { data, error } = await supabase
    .from("products")
    .select("id, category_id, slug, name_ar, name_fr, description_ar, description_fr, primary_image, images, is_featured, base_price, options_config, sort_order")
    .eq("category_id", category.id)
    .order("sort_order", { ascending: true })

  if (error || !data) return []
  return data.map((row) => mapProduct(row, slug))
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, category_id, slug, name_ar, name_fr, description_ar, description_fr, primary_image, images, is_featured, base_price, options_config, categories(slug)")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return mapProduct(data, data.categories?.[0]?.slug ?? "")
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, category_id, slug, name_ar, name_fr, description_ar, description_fr, primary_image, images, is_featured, base_price, options_config, sort_order, categories!inner(slug)")
    .eq("slug", slug)
    .single()

  if (error || !data) return null
  return mapProduct(data, data.categories?.[0]?.slug ?? "")
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, category_id, slug, name_ar, name_fr, description_ar, description_fr, primary_image, images, is_featured, base_price, options_config, categories(slug)")
    .order("created_at", { ascending: true })

  if (error || !products) return []
  return products.map((row) => mapProduct(row, row.categories?.[0]?.slug ?? ""))
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, category_id, slug, name_ar, name_fr, description_ar, description_fr, primary_image, images, is_featured, base_price, options_config, categories(slug)")
    .eq("is_featured", true)

  if (error || !products) return []
  return products.map((row) => mapProduct(row, row.categories?.[0]?.slug ?? ""))
}

export async function fetchWilayas(): Promise<Wilaya[]> {
  const { data, error } = await supabase
    .from("wilayas")
    .select("id, name_ar, name_fr, shipping_home_fee, shipping_desk_fee, is_active")
    .eq("is_active", true)
    .order("id", { ascending: true })

  if (error || !data) return []
  return data.map(mapWilaya)
}

export async function fetchPromoCode(code: string): Promise<PromoCode | null> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, discount_percentage, is_active, max_uses, current_uses, created_at")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id,
    code: data.code,
    discountPercentage: data.discount_percentage,
    isActive: data.is_active,
    maxUses: data.max_uses,
    currentUses: data.current_uses,
    createdAt: data.created_at,
  }
}

export async function fetchFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question_ar, question_fr, answer_ar, answer_fr, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error || !data) return []
  return data.map((row) => ({
    id: row.id,
    questionAr: row.question_ar,
    questionFr: row.question_fr,
    answerAr: row.answer_ar,
    answerFr: row.answer_fr,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }))
}

export async function fetchSiteSetting(key: string): Promise<{ valueAr: string; valueFr: string } | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value_ar, value_fr")
    .eq("key", key)
    .single()

  if (error || !data) return null
  return { valueAr: data.value_ar, valueFr: data.value_fr }
}
