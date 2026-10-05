import type { MetadataRoute } from "next"
import { SITE_DOMAIN } from "@/data/site"
import { securitySolutions } from "@/data/security-solutions"
import { blogPosts } from "@/data/blog"

// Admin, agreement-signing and noindex quote pages are deliberately left out —
// see robots.ts for the matching disallow list.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/services/security-solutions", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services/security-solutions/products", priority: 0.8, changeFrequency: "weekly" },
  { path: "/services/security-solutions/quote", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/car-rental", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services/car-rental/vehicles", priority: 0.8, changeFrequency: "weekly" },
  { path: "/services/it-services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/it-services/web-development", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/it-services/app-development", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/it-services/ai-automation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/testimonials", priority: 0.5, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/rental-terms", priority: 0.3, changeFrequency: "yearly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${SITE_DOMAIN}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...securitySolutions.map((s) => ({
      url: `${SITE_DOMAIN}/services/security-solutions/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((p) => {
      const d = new Date(p.date)
      return {
        url: `${SITE_DOMAIN}/blog/${p.slug}`,
        lastModified: isNaN(d.getTime()) ? now : d,
        changeFrequency: "yearly" as const,
        priority: 0.5,
      }
    }),
  ]
}
