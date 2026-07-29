import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { getITService } from "@/lib/it-services-server"

// Dashboard edits are merged in per request, so prices/copy update without a
// redeploy. Static rendering would freeze them at build time.
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const service = await getITService("app-development")
  return { title: "App Development", description: service.description }
}

export default async function AppDevelopmentPage() {
  const service = await getITService("app-development")
  return (
    <ITServiceDetail
      service={service}
      headlineWhite="Mobile Apps That"
      headlinePurple="Delight Users."
      packagesTitle="App Packages"
    />
  )
}
