import { Phone } from "lucide-react"
import Button from "@/components/ui/Button"
import WhatsAppButton from "@/components/ui/WhatsAppButton"
import { SITE_PHONE_HREF, SITE_PHONE_LOCAL } from "@/data/site"

interface QuoteCTABannerProps {
  href?: string
  title?: string
  subtitle?: string
  /** IT pages only: adds the Pak Oz Technologies WhatsApp button. */
  showWhatsApp?: boolean
}

// Site-wide closing CTA band: navy, centred, purple primary + white outline.
export default function QuoteCTABanner({
  href = "/quote",
  title = "Get Your Free Quote Today",
  subtitle = "Fast response. No obligation. Brisbane & Southeast QLD.",
  showWhatsApp = false,
}: QuoteCTABannerProps) {
  return (
    <section className="on-dark section bg-brand-navy text-center">
      <div className="container-page">
        <h2 className="text-white">{title}</h2>
        <p className="lead mx-auto mt-4">{subtitle}</p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button href={href} variant="primary" tone="dark">
            Get a Free Quote
          </Button>
          <Button href={SITE_PHONE_HREF} variant="secondary" tone="dark">
            <Phone size={16} aria-hidden="true" />
            Call {SITE_PHONE_LOCAL}
          </Button>
          {showWhatsApp && <WhatsAppButton className="h-12 px-6 text-[15px]" />}
        </div>
      </div>
    </section>
  )
}
