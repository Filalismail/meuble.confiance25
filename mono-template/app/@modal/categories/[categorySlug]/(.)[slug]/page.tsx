import { z } from "zod"
import { notFound, permanentRedirect } from "next/navigation"
import { resolveProduct } from "@/lib/product-resolver"
import { ProductModalWrapper } from "./product-modal-wrapper"

const SlugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/)

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ categorySlug: string; slug: string }>
}) {
  const { categorySlug, slug } = await params
  const validSlug = SlugSchema.parse(slug)
  const { product, redirectTo } = await resolveProduct(validSlug)

  if (!product) notFound()
  if (redirectTo) permanentRedirect(`/categories/${categorySlug}/${redirectTo}`)
  if (product.categorySlug !== categorySlug) notFound()

  return <ProductModalWrapper product={product} categorySlug={categorySlug} />
}
