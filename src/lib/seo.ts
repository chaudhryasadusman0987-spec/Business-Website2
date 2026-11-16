import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

// Page-level social metadata. Next merges `openGraph` and `twitter` shallowly,
// so a page that sets either would drop the layout's siteName/locale/card. This
// helper fills them in and gives the share image an alt text equal to the
// page's own title (the file-convention opengraph-image only has one fixed alt).

/** The share card from app/opengraph-image.tsx. */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630 }

/** The <title> the page will actually render, root template applied. */
export function resolvedTitle(title: Metadata["title"]): string {
  if (!title) return SITE_FULL
  if (typeof title === "string") return `${title} | ${SITE_FULL}`
  if ("absolute" in title && title.absolute) return title.absolute
  if ("default" in title && title.default) return title.default
  return SITE_FULL
}

export function withSocial(meta: Metadata): Metadata {
  const title = resolvedTitle(meta.title)
  const description = meta.description ?? undefined
  const og = meta.openGraph ?? {}
  // Pages with their own image (blog posts) keep it; give it the title as alt
  // when they didn't set one.
  const ogImages = og.images
    ? (Array.isArray(og.images) ? og.images : [og.images]).map((img) =>
        typeof img === "object" && !(img instanceof URL) ? { alt: title, ...img } : img
      )
    : [{ ...OG_IMAGE, alt: title }]
  const canonical = meta.alternates?.canonical
  return {
    ...meta,
    openGraph: {
      siteName: SITE_FULL,
      locale: "en_AU",
      type: "website",
      title,
      ...(description ? { description } : {}),
      ...(typeof canonical === "string" ? { url: canonical } : {}),
      ...og,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      images: ogImages,
      ...(meta.twitter ?? {}),
    },
  }
}
