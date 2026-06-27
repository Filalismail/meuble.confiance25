import { z } from "zod"
import type { Metadata } from "next"
import { CategoryPageContent } from "@/components/category-page-content"
import { getCategoryBySlug } from "@/lib/categories"

const SlugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Catégorie" }
  return {
    title: category.nameFr,
    description: `Découvrez notre collection ${category.nameFr} | Thika 25`,
    alternates: { canonical: `/categories/${slug}` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const validSlug = SlugSchema.parse(slug)
  return <CategoryPageContent slug={validSlug} />
}
