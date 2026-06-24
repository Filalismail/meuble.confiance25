import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { CategoryForm } from "../../../_components/category-form"
import { ProductOrderManager, type ProductItem } from "../../../_components/product-order-manager"
import type { Category } from "@/lib/types"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { id } = await params

  const { data: cat } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (!cat) return <div className="text-sm text-red-500">Catégorie introuvable</div>

  const category: Category = {
    id: cat.id,
    slug: cat.slug,
    nameAr: cat.name_ar,
    nameFr: cat.name_fr,
    image: cat.image || "",
    gradient: cat.gradient || "from-[#F5F0EB] to-[#E8DFD3]",
    isActive: cat.is_active,
    sortOrder: cat.sort_order,
  }

  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, name_fr, name_ar, primary_image")
    .eq("category_id", id)
    .order("sort_order", { ascending: true })

  const items: ProductItem[] = (products ?? []).map((p) => ({
    id: p.id,
    name_fr: p.name_fr,
    name_ar: p.name_ar,
    primary_image: p.primary_image || "",
  }))

  return (
    <>
      <CategoryForm category={category} />
      <div className="mt-12">
        <ProductOrderManager products={items} />
      </div>
    </>
  )
}
