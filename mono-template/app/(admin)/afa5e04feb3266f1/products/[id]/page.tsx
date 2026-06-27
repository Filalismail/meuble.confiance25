import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { ProductForm } from "../../../_components/product-form"
import type { Category, Product } from "@/lib/types"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { id } = await params

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("*, categories(slug, name_ar, name_fr)")
    .eq("id", id)
    .single()

  const { data: cats } = await supabaseAdmin
    .from("categories")
    .select("id, name_ar, name_fr")
    .order("sort_order")

  const categories: Pick<Category, "id" | "nameAr" | "nameFr">[] = (cats || []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    nameAr: c.name_ar as string,
    nameFr: c.name_fr as string,
  }))

  if (!product) return <div className="text-sm text-red-500">Produit introuvable</div>

  const mapped: Product = {
    id: product.id,
    categoryId: product.category_id,
    nameAr: product.name_ar,
    nameFr: product.name_fr,
    descriptionAr: product.description_ar || "",
    descriptionFr: product.description_fr || "",
    primaryImage: product.primary_image || "",
    images: product.images || [],
    isFeatured: product.is_featured,
    basePrice: Number(product.base_price),
    currency: "DA",
    categorySlug: product.categories?.slug || "",
    sortOrder: product.sort_order ?? 0,
    optionsConfig: product.options_config || {},
  }

  return <ProductForm categories={categories} product={mapped} />
}
