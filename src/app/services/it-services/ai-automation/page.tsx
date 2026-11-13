import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { getITService } from "@/lib/it-services-server"

// Dashboard edits are merged in per request, so prices/copy update without a
// redeploy. Static rendering would freeze them at build time.
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const service = await getITService("ai-automation")
  return {
    title: "AI Automation",
    description: service.description,
    alternates: { canonical: "/services/it-services/ai-automation" },
  }
}

// EXTRA SECTION — "See AI in action" (between packages and process)
function SeeAIInAction() {
  return (
    <section className="relative overflow-hidden bg-brand-hero text-center on-dark py-16 lg:py-24">
      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-accent text-[11px] font-semibold uppercase tracking-widest">
          See AI in Action
        </p>
        <h3 className="text-white font-bold text-[28px] mt-3">
          The chat on this website is our AI.
        </h3>
        <p className="max-w-[500px] mx-auto text-muted mt-4">
          The chat bubble in the bottom-right corner of this website was built
          by us. Your business can have the same — customised with your services,
          prices and business personality.
        </p>
        <p className="mt-6 text-accent text-[15px] font-medium">
          👇 Try the chat bubble now — bottom right
        </p>
      </div>
    </section>
  )
}

export default async function AIAutomationPage() {
  const service = await getITService("ai-automation")
  return (
    <ITServiceDetail
      service={service}
      headlineWhite="AI That Works"
      headlinePurple="While You Sleep."
      packagesTitle="AI Packages"
      extra={<SeeAIInAction />}
    />
  )
}
