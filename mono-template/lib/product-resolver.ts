import { cache } from "react"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchProductBySlug } from "@/lib/data"
import type { Product } from "@/lib/types"

export interface ProductResolution {
  product: Product | null
  redirectTo: string | null
}

async function resolveProductImpl(slug: string): Promise<ProductResolution> {
  const product = await fetchProductBySlug(slug)
  if (product) return { product, redirectTo: null }

  const { data: redirect } = await supabaseAdmin
    .from("product_slug_redirects")
    .select("new_slug")
    .eq("old_slug", slug)
    .maybeSingle()

  if (!redirect) return { product: null, redirectTo: null }

  const targetProduct = await fetchProductBySlug(redirect.new_slug)
  if (!targetProduct) return { product: null, redirectTo: null }

  return { product: targetProduct, redirectTo: redirect.new_slug }
}

export const resolveProduct = cache(resolveProductImpl)
