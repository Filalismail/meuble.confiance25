import { z } from "zod"
import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { resolveProduct } from "@/lib/product-resolver"
import { getAllProducts } from "@/lib/categories"
import { getSiteSettings } from "@/lib/site-settings"
import { ProductContent } from "@/components/product-content"

const SlugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/)

export const revalidate = 3600

export async function generateStaticParams() {
  const all = await getAllProducts()
  return all
    .filter((p) => p.categorySlug && p.slug)
    .map((p) => ({
      categorySlug: p.categorySlug,
      slug: p.slug,
    }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; slug: string }>
}): Promise<Metadata> {
  const { categorySlug, slug } = await params
  const validSlug = SlugSchema.parse(slug)
  const { product, redirectTo } = await resolveProduct(validSlug)

  if (!product || (redirectTo)) return {}

  const settings = await getSiteSettings()
  const title = `${product.nameFr} | ${settings.shopName}`
  const description = product.descriptionFr?.slice(0, 160) || ""

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${categorySlug}/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: product.primaryImage ? [{ url: product.primaryImage }] : [],
    },
  }
}

export default async function ProductPage({
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameFr,
    description: product.descriptionFr,
    image: product.primaryImage || undefined,
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: "DZD",
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <ProductContent product={product} />
      </div>
    </main>
  )
}
