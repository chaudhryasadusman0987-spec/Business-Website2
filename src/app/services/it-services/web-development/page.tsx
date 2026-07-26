import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { itServiceItems } from "@/data/it-services"

const service = itServiceItems.find((s) => s.id === "web-development")!

export const metadata: Metadata = {
  title: "Web Development",
  description: service.description,
}

export default function WebDevelopmentPage() {
  return (
    <ITServiceDetail
      service={service}
      headlineWhite="Websites That"
      headlinePurple="Convert."
      packagesTitle="Web Packages"
    />
  )
}
