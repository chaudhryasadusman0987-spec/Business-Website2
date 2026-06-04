This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
