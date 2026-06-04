import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { itServiceItems } from "@/data/it-services"
import { SITE_FULL } from "@/data/site"

const service = itServiceItems.find((s) => s.id === "web-development")!

export const metadata: Metadata = {
  title: `Web Development | ${SITE_FULL}`,
  description: service.description,
}

export default function WebDevelopmentPage() {
  return (
    <ITServiceDetail
      service={service}
      headlineWhite="Websites That"
      headlinePurple="Convert."
      packagesTitle="Web Packages"
      floatingBadge={{ title: "50+ Websites Delivered", sub: "Australia-wide" }}
    />
  )
}
