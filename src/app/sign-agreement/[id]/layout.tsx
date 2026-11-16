import { withSocial } from "@/lib/seo"
export const metadata = withSocial({
  title: "Sign Your Rental Agreement",
  robots: "noindex, nofollow",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
