import type { MetadataRoute } from "next"
import { SITE_DOMAIN } from "@/data/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/rental-admin", "/sign-agreement/", "/quote"],
    },
    sitemap: `${SITE_DOMAIN}/sitemap.xml`,
    host: SITE_DOMAIN,
  }
}
