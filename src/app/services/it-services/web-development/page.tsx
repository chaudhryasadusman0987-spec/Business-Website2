import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { getITService } from "@/lib/it-services-server"

// Dashboard edits are merged in per request, so prices/copy update without a
// redeploy. Static rendering would freeze them at build time.
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const service = await getITService("web-development")
  return { title: "Web Development", description: service.description }
}

export default async function WebDevelopmentPage() {
  const service = await getITService("web-development")
  return (
    <ITServiceDetail
      service={service}
      headlineWhite="Websites That"
      headlinePurple="Convert."
      packagesTitle="Web Packages"
    />
  )
}
