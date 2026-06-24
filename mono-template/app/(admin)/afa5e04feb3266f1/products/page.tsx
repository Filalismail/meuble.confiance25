import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { ProductListClient, type ProductRow } from "./product-list-client"
import type { Product, Category } from "@/lib/types"

export default async function ProductsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, name_ar, name_fr, primary_image, base_price, is_featured, categories(slug, name_ar, name_fr)")
    .order("created_at", { ascending: false })

  const { data: cats } = await supabaseAdmin
    .from("categories")
    .select("id, slug, name_ar, name_fr")
    .order("sort_order")

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  return (
    <div>
      <ProductListClient
        products={(products as unknown as ProductRow[]) || []}
        categories={((cats || []) as unknown) as Pick<Category, "id" | "slug" | "nameAr" | "nameFr">[]}
      />
    </div>
  )
}
