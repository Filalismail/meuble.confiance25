import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../_actions/_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { CategoryListClient } from "./category-list-client"
import type { Category } from "@/lib/types"

export default async function CategoriesPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order")

  if (error) return <div className="text-sm text-red-500">{error.message}</div>

  const categories: Category[] = (data || []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    slug: c.slug as string,
    nameAr: c.name_ar as string,
    nameFr: c.name_fr as string,
    image: (c.image as string) || "",
    gradient: (c.gradient as string) || "from-[#F5F0EB] to-[#E8DFD3]",
    isActive: c.is_active as boolean,
    sortOrder: c.sort_order as number,
  }))

  return <CategoryListClient categories={categories} />
}
