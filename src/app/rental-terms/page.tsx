export const metadata = {
  title: "Rental Terms & Conditions | Pak Oz Rentals",
  description:
    "Full terms and conditions for Pak Oz Rentals vehicle hire in Brisbane.",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <h2 className="font-bold text-[18px] text-[#1a1a2e] mb-3">{title}</h2>
      <div className="text-[14px] text-[#444] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

export default function RentalTermsPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f8] py-12 px-4">
      <div className="max-w-[800px] mx-auto bg-white rounded-[20px] p-8 lg:p-12 shadow-sm">
        <p className="text-[12px] font-bold text-[#7f85f7] uppercase tracking-wider mb-1">
          Pak Oz Rentals — A Pak Oz Solutions Company
        </p>
        <h1 className="font-bold text-[28px] text-[#1a1a2e] mb-8">
          Vehicle Lease Agreement — Terms &amp; Conditions
        </h1>

        <Section title="Registered Owner">
          <p>Pak Oz Solutions Pty Ltd (trading as Pak Oz Rentals)</p>
          <p>1 Cedrus St, Sunnybank Hills QLD 4109</p>
          <p>Contact: 0424 948 512 / +61 480 488 080</p>
          <p>Email: pakozsolutions.com.au</p>
          <p className="text-[13px] text-[#666] italic">
            The parties choose the addresses stated in the signed agreement
            as their physical addresses at which legal proceedings may be
            instituted. Insurance covers Queensland only unless otherwise
            agreed in writing.
          </p>
        </Section>

        <Section title="Vehicle & Kilometre Allowance">
          <p>
            The vehicle and its registration, make, model, year, VIN and
            starting odometer reading are recorded in the signed agreement.
            Kilometres are unlimited, subject to the Prohibited Use terms
            below.
          </p>
        </Section>

        <Section title="Rental Terms">
          <p>
            Rent is charged weekly, in advance. Along with the weekly rent,
            a refundable security deposit and an insurance access fee (which
            covers your excess in the event of a claim) apply as set out in
            the signed agreement.
          </p>
          <p>
            The minimum rental period is 4 weeks. After the minimum period,
            the agreement continues on a week-to-week basis until either
            party gives 1 week&apos;s written notice.
          </p>
          <p>
            If the Rentee returns the vehicle before completing the 4-week
            minimum period, 50% of the remaining rent up to the 4-week mark
            is still payable to the Owner, unless otherwise agreed in
            writing.
          </p>
        </Section>

        <Section title="Rentee: Important Information">
          <p>
            <strong className="text-[#1a1a2e]">Damage to Vehicle —</strong>{" "}
            You are responsible for any loss or damage to the vehicle during
            the rental, even if it is not your fault, subject to the
            exceptions set out below. The minimum amount payable is the
            Insurance Access Fee, plus any loss of rental income during the
            vehicle&apos;s repair period, per incident.
          </p>
          <p>
            <strong className="text-[#1a1a2e]">Prohibited Use —</strong>{" "}
            Prohibited Use includes: driving recklessly or under the
            influence; driving on unsealed roads or failing to safeguard the
            vehicle; unauthorised drivers; using the vehicle for hire or
            reward (e.g. rideshare) without written consent; subletting or
            selling the vehicle; racing or track use; driving through
            floodwater or a natural disaster that could reasonably be
            avoided; driving outside a 100km radius of Brisbane without the
            Owner&apos;s permission. If loss or damage results from a
            Prohibited Use, the Insurance Access Fee cap does not apply and
            the Rentee is responsible for the full value of the vehicle and
            any third-party property damage.
          </p>
          <p>
            <strong className="text-[#1a1a2e]">
              Personal Possessions —
            </strong>{" "}
            The Owner is not responsible for any loss or damage to the
            Rentee&apos;s or passengers&apos; personal possessions left in
            the vehicle.
          </p>
          <p>
            <strong className="text-[#1a1a2e]">
              Roadside Assistance —
            </strong>{" "}
            Provided for breakdowns that are not your fault. If assistance
            is needed for an issue that is your fault (e.g. flat battery,
            lost keys, punctured tyre), the Rentee is responsible for that
            cost.
          </p>
        </Section>

        <Section title="What Is Included">
          <p>
            Service &amp; maintenance; comprehensive insurance (subject to
            the Insurance Access Fee); roadside assistance for faults not
            the Rentee&apos;s fault; unlimited kilometres under normal use;
            full tank of fuel at pickup (if not returned full, refuelling is
            charged per the Fees table below).
          </p>
        </Section>

        <Section title="What Is Not Included">
          <p>
            Unlisted/unauthorised drivers; fines, parking charges and tolls
            incurred during the rental; loss of income due to breakdown
            that is the Rentee&apos;s fault.
          </p>
        </Section>

        <Section title="Termination of Agreement">
          <p>
            After the minimum rental period, either party may terminate by
            giving 1 week&apos;s written notice. The Owner may terminate at
            any time with 24 hours&apos; notice if rent/fees are overdue, if
            the Owner reasonably believes the Rentee has breached or is
            likely to breach this agreement, or if there are reasonable
            grounds to believe the vehicle is being used for a Prohibited
            Use or is being abused. Clauses relating to Liability for
            Damage and Loss survive termination.
          </p>
        </Section>

        <Section title="Excess Liability — Fault and Non-Fault Accidents">
          <p>
            If you are AT FAULT, you are responsible for the full Insurance
            Access Fee plus any loss of rental income during repair. If you
            are NOT AT FAULT, you must provide sufficient third-party
            information (name, licence, registration, photos/video, and an
            admission of fault). If this is not provided or insufficient,
            the Rentee remains responsible for the Insurance Access Fee
            regardless of fault.
          </p>
        </Section>

        <Section title="Charges Explained">
          <div className="border border-[#e8e8f0] rounded-[12px] overflow-hidden">
            {[
              ["Unpaid Toll Notice", "$5 + toll amount"],
              ["Infringement Nomination", "$10 + fine amount"],
              [
                "Late Payment Fee",
                "22% of amount owing (after 3 days overdue)",
              ],
              ["Refuelling Price", "$2.50 per litre"],
              ["Key Replacement", "$400 per key"],
              ["Early Return Fee", "$400"],
              ["Damage Assessment Admin Fee", "$20"],
              ["Age Excess (21–25)", "$500–$1,000"],
              ["Inexperienced Driver Fee", "$695 (licence held < 2 years)"],
            ].map(([label, fee], i) => (
              <div
                key={label}
                className={`flex justify-between px-4 py-3 text-[13px] ${
                  i % 2 === 0 ? "bg-[#f8f8ff]" : "bg-white"
                }`}
              >
                <span className="text-[#1a1a2e] font-medium">{label}</span>
                <span className="text-[#666]">{fee}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[#666] mt-3">
            Drivers must be aged 21–75, hold a current valid licence (not a
            learner&apos;s permit); international licences require a
            certified English translation. Only a driver nominated in
            writing by the Owner may drive the vehicle.
          </p>
        </Section>

        <Section title="Return">
          <p>
            The vehicle must be returned to the agreed location on the
            date/time stated, or as otherwise agreed. Late return starts a
            new rental period at the standard weekly rate. All personal
            belongings must be removed on return.
          </p>
        </Section>

        <Section title="Repossession">
          <p>
            If the Rentee fails to return the vehicle when required (other
            than due to theft or accident), the Owner will issue a written
            demand. If not returned within 24 hours, the Owner may take
            reasonable steps to recover the vehicle. The Rentee remains
            liable for all rental charges, damage, towing, storage, loss of
            rental income, and repossession costs.
          </p>
        </Section>

        <p className="text-[13px] font-semibold text-[#1a1a2e] border-t border-[#e8e8f0] pt-6">
          By signing a vehicle lease agreement, both parties acknowledge and
          agree to these terms.
        </p>
        <p className="text-[12px] text-[#9496a8] mt-4">
          Pak Oz Rentals • 0424 948 512 / +61 480 488 080 •
          pakozsolutions.com.au
        </p>
      </div>
    </div>
  )
}
