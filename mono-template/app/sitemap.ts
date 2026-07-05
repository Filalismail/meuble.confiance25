import type { MetadataRoute } from "next"
import { getCategories } from "@/lib/categories"
import { fetchAllProducts } from "@/lib/data"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://thika25.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  let categorySlugs: string[] = []
  try {
    const categories = await getCategories()
    categorySlugs = categories.filter((c) => c.isActive).map((c) => c.slug)
  } catch {
    categorySlugs = []
  }

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}
