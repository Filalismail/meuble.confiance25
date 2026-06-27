"use client"

import { useRouter } from "next/navigation"
import { ProductQuickView } from "@/components/product-quick-view"
import type { Product } from "@/lib/types"

export function ProductModalWrapper({
  product,
  categorySlug,
}: {
  product: Product
  categorySlug: string
}) {
  const router = useRouter()

  return (
    <ProductQuickView
      product={product}
      onClose={() => router.push(`/categories/${categorySlug}`, { scroll: false })}
    />
  )
}
