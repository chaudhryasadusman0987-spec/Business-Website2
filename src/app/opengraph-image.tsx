import { ImageResponse } from "next/og"
import { SITE_FULL, SITE_TAGLINE, SITE_DOMAIN } from "@/data/site"

// Site-wide 1200x630 social card. Runs on the edge runtime because the Node
// build of @vercel/og in Next 14 breaks on Windows paths ("Invalid URL").
// Pages that set their own openGraph.images (blog posts) override it.
export const alt = `${SITE_FULL} — Security, Car Rental & IT Services Brisbane`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const runtime = "edge"

export default async function OpengraphImage() {
  const mark = await fetch(
    new URL("../../public/images/pak-oz-mark.png", import.meta.url),
  ).then((r) => r.arrayBuffer())
  // Satori accepts an ArrayBuffer as <img src>; the cast satisfies the DOM type.
  const markSrc = mark as unknown as string

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0d0d1a",
          // Satori only handles a single gradient layer, so the site's grid
          // pattern becomes one soft brand-purple glow here.
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(127,133,247,0.35), rgba(13,13,26,0) 60%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={markSrc}
            width={120}
            height={120}
            alt=""
            style={{ borderRadius: 24, background: "#ffffff" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
              {SITE_FULL}
            </div>
            <div style={{ fontSize: 30, color: "#dee4fd" }}>{SITE_TAGLINE}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", gap: 18 }}>
            {["CCTV & Security", "Car Rental", "IT & AI Services"].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "#7f85f7",
                  fontSize: 30,
                  fontWeight: 600,
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#9a9cc0" }}>
            Brisbane &amp; South East QLD · {SITE_DOMAIN.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
