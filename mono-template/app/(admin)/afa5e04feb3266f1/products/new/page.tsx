import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { ProductForm } from "../../../_components/product-form"
import type { Category, Product } from "@/lib/types"

export default async function NewProductPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data: cats } = await supabaseAdmin
    .from("categories")
    .select("id, name_ar, name_fr")
    .order("sort_order")

  const categories: Pick<Category, "id" | "nameAr" | "nameFr">[] = (cats || []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    nameAr: c.name_ar as string,
    nameFr: c.name_fr as string,
  }))

  return <ProductForm categories={categories} />
}
