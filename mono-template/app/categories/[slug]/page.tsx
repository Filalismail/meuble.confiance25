import { z } from "zod"
import { CategoryPageContent } from "@/components/category-page-content"

const SlugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/)

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const validSlug = SlugSchema.parse(slug)
  return <CategoryPageContent slug={validSlug} />
}
