import { CategoryPageContent } from "@/components/category-page-content"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CategoryPageContent slug={slug} />
}
