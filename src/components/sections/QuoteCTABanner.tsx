import Link from "next/link"
import WhatsAppButton from "@/components/ui/WhatsAppButton"

interface QuoteCTABannerProps {
  href?: string
  title?: string
  subtitle?: string
  /** IT pages only: adds the Pak Oz Technologies WhatsApp button. */
  showWhatsApp?: boolean
}

export default function QuoteCTABanner({
  href = "/quote",
  title = "Get Your Free Quote Today",
  subtitle = "Fast response. No obligation. Brisbane & Southeast QLD.",
  showWhatsApp = false,
}: QuoteCTABannerProps) {
  return (
    <section className="bg-brand-primary py-[80px] text-center">
      <div className="max-w-[1170px] mx-auto px-4">
        <h2 className="text-[45px] font-bold text-white uppercase leading-tight">
          {title}
        </h2>
        <p className="text-white/80 text-lg mt-4">{subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={href}
            className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-brand-primary rounded-[5px] text-[17px] font-medium h-[69px] px-10 transition-all duration-500"
          >
            Get Free Quote
          </Link>
          {showWhatsApp && (
            <WhatsAppButton className="h-[69px] rounded-[5px] px-10 text-[17px]" />
          )}
        </div>
      </div>
    </section>
  )
}
