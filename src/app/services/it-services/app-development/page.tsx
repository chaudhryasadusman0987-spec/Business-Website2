import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { itServiceItems } from "@/data/it-services"
import { SITE_FULL } from "@/data/site"

const service = itServiceItems.find((s) => s.id === "app-development")!

export const metadata: Metadata = {
  title: `App Development | ${SITE_FULL}`,
  description: service.description,
}

export default function AppDevelopmentPage() {
  return (
    <ITServiceDetail
      service={service}
      headlineWhite="Mobile Apps That"
      headlinePurple="Delight Users."
      packagesTitle="App Packages"
      floatingBadge={{ title: "20+ Apps Delivered", sub: "Brisbane & Southeast QLD" }}
    />
  )
}
