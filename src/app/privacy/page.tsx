import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, LegalSection } from "@/components/legal/LegalPage"
import {
  COMPANY_ABN,
  COMPANY_LEGAL_NAME,
  COMPANY_OFFICE_LOCALITY,
  SITE_EMAIL,
  SITE_FULL,
  SITE_PHONE,
  SITE_PHONE_HREF,
} from "@/data/site"

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy",
  description: `How ${SITE_FULL} collects, uses, stores and protects your personal information.`,
}

// Change this whenever the policy text changes.
const UPDATED = "13 November 2026"

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      href="/privacy"
      updated={UPDATED}
      intro={
        <>
          <p>
            {COMPANY_LEGAL_NAME} (ABN {COMPANY_ABN}), trading as {SITE_FULL}, Pak Oz CCTV, Pak Oz
            Rentals and Pak Oz Technologies (&ldquo;we&rdquo;, &ldquo;us&rdquo;), respects your
            privacy. This policy explains what personal information we collect, why we collect it,
            and how we handle it, in line with the Privacy Act 1988 (Cth) and the Australian Privacy
            Principles.
          </p>
          <p>By using this website or our services you agree to this policy.</p>
        </>
      }
    >
      <LegalSection title="1. Information we collect">
        <p>We only collect information that we need to provide our services. This may include:</p>
        <ul>
          <li>
            <strong>Contact and enquiry details</strong>: your name, phone number, email address,
            suburb and the details of your enquiry or quote request.
          </li>
          <li>
            <strong>Newsletter sign-ups</strong>: your email address.
          </li>
          <li>
            <strong>Chat messages</strong>: what you type into the chat assistant on our website.
          </li>
          <li>
            <strong>Car rental applications and agreements</strong>: your name, date of birth,
            residential address, driver licence number, state and images of your licence, your
            electronic signature, and the date, time, IP address and browser details recorded when
            you sign. We also keep photos of the vehicle&apos;s condition at pick-up and return.
          </li>
          <li>
            <strong>Payment information</strong>: card payments and saved cards are handled by our
            payment provider, Stripe. We do not see or store your full card number.
          </li>
          <li>
            <strong>Technical information</strong>: standard information your browser sends when
            you visit, such as your IP address, browser type and the pages you view, which our
            hosting provider records in server logs.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <ul>
          <li>to respond to enquiries, prepare quotes and provide the services you ask for;</li>
          <li>
            to assess rental applications, prepare and enforce rental agreements, take payments,
            and manage tolls, fines, damage and disputes;
          </li>
          <li>to send newsletters and offers, where you have signed up;</li>
          <li>to run, secure and improve our website; and</li>
          <li>to meet our legal, insurance and record-keeping obligations.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="3. Who we share it with">
        <p>
          We share information only as needed to run our business, with service providers who act
          on our behalf, including:
        </p>
        <ul>
          <li>Vercel (website hosting and file storage);</li>
          <li>Neon (database hosting);</li>
          <li>Stripe (payments);</li>
          <li>Google (the chat assistant, which is powered by Google Gemini, and Google Maps);</li>
          <li>our email provider, to send and receive email.</li>
        </ul>
        <p>
          For car rentals we may also share information with insurers, toll operators, police,
          road authorities and debt collectors where it relates to your hire, as allowed by the
          rental agreement or required by law. We may otherwise disclose information where the law
          requires or authorises it.
        </p>
      </LegalSection>

      <LegalSection title="4. Storage overseas">
        <p>
          Some of our service providers store or process data on servers outside Australia,
          including in the United States. We choose reputable providers and take reasonable steps
          to make sure your information is handled consistently with the Australian Privacy
          Principles.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and browser storage">
        <p>
          The public pages of our website do not use advertising or tracking cookies. We use:
        </p>
        <ul>
          <li>a sign-in cookie on our private staff pages only;</li>
          <li>
            your browser&apos;s local storage to remember an offer you have made on a rental
            vehicle, so you can see its status when you come back.
          </li>
        </ul>
        <p>
          Some pages show an embedded Google map. Google may set its own cookies when the map
          loads; see Google&apos;s privacy policy for details.
        </p>
      </LegalSection>

      <LegalSection title="6. Google reviews">
        <p>
          Our testimonials are reviews you or others have posted publicly on our Google Business
          Profile. We show them as Google returns them and do not store them ourselves.
        </p>
      </LegalSection>

      <LegalSection title="7. Security and retention">
        <p>
          We take reasonable steps to protect your information from misuse, loss and unauthorised
          access, including encrypted connections and access limited to staff who need it. We keep
          information only for as long as we need it for the purposes above or as the law
          requires, and then delete or de-identify it.
        </p>
      </LegalSection>

      <LegalSection title="8. Marketing">
        <p>
          You can stop receiving our newsletter at any time by emailing{" "}
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> and we will remove you.
        </p>
      </LegalSection>

      <LegalSection title="9. Accessing or correcting your information">
        <p>
          You can ask to see the personal information we hold about you, or ask us to correct it.
          Contact us using the details below and we will respond within a reasonable time,
          normally 30 days.
        </p>
      </LegalSection>

      <LegalSection title="10. Complaints">
        <p>
          If you have a concern about how we have handled your information, please contact us
          first and we will try to resolve it. If you are not satisfied with our response, you can
          contact the Office of the Australian Information Commissioner at{" "}
          <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
            oaic.gov.au
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="11. Contact us">
        <p>
          {COMPANY_LEGAL_NAME}, {COMPANY_OFFICE_LOCALITY}
          <br />
          Email: <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          <br />
          Phone: <a href={SITE_PHONE_HREF}>{SITE_PHONE}</a>
        </p>
        <p>
          We may update this policy from time to time. The current version is always on this
          page. See also our <Link href="/terms">Terms of Use</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
