import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, LegalSection } from "@/components/legal/LegalPage"
import {
  COMPANY_ABN,
  COMPANY_ACN,
  COMPANY_LEGAL_NAME,
  COMPANY_OFFICE_LOCALITY,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_FULL,
  SITE_PHONE,
  SITE_PHONE_HREF,
} from "@/data/site"

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms of Use",
  description: `The terms that apply when you use the ${SITE_FULL} website, request a quote or use our services.`,
}

// Change this whenever the terms change.
const UPDATED = "13 November 2026"

export default function TermsPage() {
  const domain = SITE_DOMAIN.replace(/^https?:\/\//, "")
  return (
    <LegalPage
      title="Terms of Use"
      href="/terms"
      updated={UPDATED}
      intro={
        <>
          <p>
            This website ({domain}) is operated by {COMPANY_LEGAL_NAME} (ABN {COMPANY_ABN}, ACN{" "}
            {COMPANY_ACN}), trading as {SITE_FULL} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using
            this website you agree to these terms. If you do not agree, please do not use the site.
          </p>
        </>
      }
    >
      <LegalSection title="1. Information on this website">
        <p>
          We work to keep the information on this website accurate and up to date, but it is
          general information only. Product details, availability and prices can change without
          notice and may contain errors. Prices are in Australian dollars; whether GST applies is
          shown with the price or on your written quote.
        </p>
      </LegalSection>

      <LegalSection title="2. Quotes and estimates">
        <p>
          Prices from our online quote tools, the chat assistant or this website are estimates
          only. A job is confirmed only when we give you a written quote and you accept it. A
          written quote is valid for the period stated on it, or 30 days if no period is stated,
          and may change if the scope of work or site conditions turn out to be different from
          what was described.
        </p>
      </LegalSection>

      <LegalSection title="3. Our services">
        <ul>
          <li>
            <strong>Security and CCTV installation</strong>: carried out under the written quote
            you accept, which sets out the equipment, work, price and any warranty.
          </li>
          <li>
            <strong>IT, web, app and AI services</strong>: carried out under the written quote or
            project agreement you accept, which sets out the scope, timing and payment terms.
          </li>
          <li>
            <strong>Car rental</strong>: governed by our{" "}
            <Link href="/rental-terms">Rental terms</Link> and the rental agreement you sign. If
            anything in these terms conflicts with them, the rental terms and agreement apply.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Chat assistant">
        <p>
          The chat assistant on this website uses artificial intelligence to answer general
          questions. Its answers may be incomplete or wrong and are not a quote, advice or a
          binding offer. Please confirm anything important with us directly.
        </p>
      </LegalSection>

      <LegalSection title="5. Using this website">
        <p>You agree not to:</p>
        <ul>
          <li>use the website for anything unlawful, or submit false or misleading information;</li>
          <li>try to gain unauthorised access to the website, its systems or private areas;</li>
          <li>interfere with the website, for example with malware, scraping or excessive requests.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          The content of this website, including text, logos and images we own, belongs to us or
          our licensors. You may view and print it for your own personal use, but you may not copy,
          republish or use it commercially without our written permission. Product names and
          trade marks of other companies belong to their owners.
        </p>
      </LegalSection>

      <LegalSection title="7. Links to other websites">
        <p>
          This website links to other websites, such as Google and WhatsApp. We are not
          responsible for their content or how they handle your information.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights under Australian Consumer Law">
        <p>
          Our goods and services come with guarantees that cannot be excluded under the Australian
          Consumer Law. Nothing in these terms limits any right or remedy you have under that law.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the extent the law allows, and except for the guarantees above, we are not liable for
          any indirect or consequential loss arising from your use of this website or your
          reliance on its information. Where our liability for a failure to meet a consumer
          guarantee can be limited, it is limited to supplying the goods or services again, or
          paying the cost of having them supplied again, or repairing or replacing the goods.
        </p>
      </LegalSection>

      <LegalSection title="10. Privacy">
        <p>
          How we handle your personal information is explained in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law">
        <p>
          These terms are governed by the laws of Queensland, Australia, and you agree to the
          jurisdiction of the Queensland courts.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes and contact">
        <p>
          We may update these terms from time to time. The current version is always on this
          page. Questions? Contact {COMPANY_LEGAL_NAME}, {COMPANY_OFFICE_LOCALITY}, at{" "}
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> or{" "}
          <a href={SITE_PHONE_HREF}>{SITE_PHONE}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
