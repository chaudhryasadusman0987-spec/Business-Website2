import type { MetadataRoute } from "next"
import { SITE_DOMAIN } from "@/data/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private areas only. Every public page (quote forms included) is crawlable.
      disallow: ["/api/", "/dashboard", "/rental-admin", "/demo", "/lead-finder", "/sign-agreement/"],
    },
    sitemap: `${SITE_DOMAIN}/sitemap.xml`,
    host: SITE_DOMAIN,
  }
}
