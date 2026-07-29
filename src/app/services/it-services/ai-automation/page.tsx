import type { Metadata } from "next"
import ITServiceDetail from "@/components/sections/ITServiceDetail"
import { getITService } from "@/lib/it-services-server"

// Dashboard edits are merged in per request, so prices/copy update without a
// redeploy. Static rendering would freeze them at build time.
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const service = await getITService("ai-automation")
  return { title: "AI Automation", description: service.description }
}

// EXTRA SECTION — "See AI in action" (between packages and process)
function SeeAIInAction() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d1a] py-[80px] text-center">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="relative z-10 max-w-[1170px] mx-auto px-4">
        <p className="text-[#7f85f7] text-[11px] font-semibold uppercase tracking-widest">
          See AI in Action
        </p>
        <h3 className="text-white font-bold text-[28px] mt-3">
          The chat on this website is our AI.
        </h3>
        <p className="max-w-[500px] mx-auto text-[#9496a8] mt-4">
          The chat bubble in the bottom-right corner of this website was built
          by us. Your business can have the same — customised with your services,
          prices and business personality.
        </p>
        <p className="mt-6 text-[#7f85f7] text-[15px] font-medium">
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
