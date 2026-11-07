# Pak Oz Solutions — Website

Production site for Pak Oz Solutions Pty Ltd (Brisbane & SEQ) — **pakozsolutions.com.au**.
Security (Pak Oz CCTV), car rental (Pak Oz Rentals) and IT/AI services (Pak Oz Technologies).

Full details: see `PROJECT.md` (architecture, env vars, rules) and `BUILD_PLAN.md` (status).

## Getting Started

```bash
npm install
npm run build   # always verify with a build — dev can hang on the Google Fonts fetch
npm run dev     # http://localhost:3000
```

Create `.env.local` with the variables listed in `PROJECT.md` §12.
⚠ `DATABASE_URL` in `.env.local` is the **live** Neon database — clean up any test data.

First-time database setup: visit `/api/db/setup` once (creates tables, seeds once).

## Admin

- `/dashboard` — products, packages, vehicles, rentals, discounts, leads (`ADMIN_PASSWORD`)
- `/rental-admin` — rentals, offers, agreements, disputes (`RENTAL_ADMIN_PASSWORD`)
- `/lead-finder` — prospect search, separate login (`LEAD_FINDER_PASSWORD`)

## Deploy on Vercel

Push to `master` → Vercel deploys automatically. Set all env vars in Vercel →
Project Settings → Environment Variables, then **redeploy**.

## Adding Product & Solution Images

### Where to put images
- Solution hero images: `public/images/solutions/`
- Product images:       `public/images/products/`
- Home hero image:      `public/images/hero.jpg` (already added)

### File naming
Match the paths in `src/data/security-solutions.ts`. Examples:
- `public/images/products/hd-bullet-cam.jpg`
- `public/images/solutions/surveillance.jpg`

### Recommended image sizes
- Product images:  800×600px, JPG, under 200KB
- Solution heroes: 1200×800px, JPG, under 400KB

### How to update from the dashboard
Go to `/dashboard` → **Products** tab → select a solution → edit the image path
→ click **Save**.

### If no image is uploaded
The site shows a professional **"Image Coming Soon"** placeholder automatically
(via `ImageWithFallback`). The site works fine without any product images.

## Adding Vehicle Images

### Where to put images
`public/images/vehicles/`

### File names (match exactly)
- `public/images/vehicles/economy.jpg`
- `public/images/vehicles/compact-suv.jpg`
- `public/images/vehicles/midsize.jpg`
- `public/images/vehicles/large-suv.jpg`
- `public/images/vehicles/van.jpg`
- `public/images/vehicles/luxury.jpg`

### Recommended size
800×500px landscape JPG, under 250KB.

### Free image sources
Search these on [unsplash.com](https://unsplash.com) or [pexels.com](https://pexels.com):
- **Economy:**     "small hatchback car white"
- **Compact SUV:** "kia sportage silver SUV"
- **Mid-size:**    "toyota camry sedan"
- **Large SUV:**   "7 seat SUV people mover"
- **Van:**         "toyota hiace minibus"
- **Luxury:**      "bmw 5 series silver"

### If no image is uploaded
The site shows a **"Photo coming soon"** placeholder automatically. The site
works fine without any vehicle images.

### Update from the dashboard
Go to `/dashboard` → **Car Rental** tab → edit the image path → click **Save**.
