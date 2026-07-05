import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://thika25.com"
const ADMIN_PATH = process.env.ADMIN_SECRET_PATH || "afa5e04feb3266f1"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [`/${ADMIN_PATH}`, "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
