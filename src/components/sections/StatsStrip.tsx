"use client"

import CountUp from "@/components/ui/CountUp"
import { useFleetCounts } from "@/hooks/useFleetCounts"
import { deliveredProjects } from "@/data/portfolio"
import { SECURITY_SINCE, SITE_AREA_SHORT } from "@/data/site"

// Small strip under the homepage hero. Every figure is real: the year comes
// from site.ts, the car count is live from the database, and the website count
// is the number of delivered projects in src/data/portfolio.ts.
export default function StatsStrip() {
  const fleet = useFleetCounts()

  return (
    <section aria-label="At a glance" className="on-dark border-t border-white/10 bg-brand-navy">
      <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-6 py-8 lg:grid-cols-4">
        <Stat label="Security experience">
          Since <CountUp end={SECURITY_SINCE} start={SECURITY_SINCE - 18} />
        </Stat>
        <Stat label="On the yard">
          {/* Hidden until the live count arrives — never a placeholder number. */}
          {fleet ? (
            <>
              <CountUp end={fleet.onYard} /> cars
            </>
          ) : (
            "Weekly hire"
          )}
        </Stat>
        <Stat label="Delivered">
          <CountUp end={deliveredProjects.length} /> websites
        </Stat>
        <Stat label="Service area">{SITE_AREA_SHORT}</Stat>
      </dl>
    </section>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    // dt/dd order is swapped visually so the figure reads first.
    <div className="flex flex-col-reverse">
      <dt className="mt-1 text-[13px] text-muted">{label}</dt>
      <dd className="font-heading text-[1.25rem] font-semibold leading-tight text-white lg:text-[1.5rem]">
        {children}
      </dd>
    </div>
  )
}
