import { Link } from "react-router";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of these terms",
    body: (
      <p>
        These Terms of Service govern your access to and use of INSPECTRA, a real estate
        platform operating in Nigeria. By creating an account, listing a property, or
        otherwise using the platform, you agree to these terms. If you do not agree, please
        do not use INSPECTRA.
      </p>
    ),
  },
  {
    id: "service",
    heading: "What INSPECTRA provides",
    body: (
      <>
        <p>
          INSPECTRA connects property seekers with realtors and listings. Our distinguishing
          promise is dual verification: we review both the property (title, documents and
          fees) and the realtor (through a certification program) before a listing is marked
          Verified.
        </p>
        <p>
          Verification is an informational signal, not a legal guarantee of title, ownership,
          or fitness. You remain responsible for your own due diligence before entering any
          transaction.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "Accounts and eligibility",
    body: (
      <>
        <p>
          You must be at least 18 years old and able to form a binding contract to use
          INSPECTRA. You are responsible for the accuracy of the information you provide and
          for keeping your login credentials secure.
        </p>
        <p>
          You are responsible for all activity that happens under your account. Notify us
          promptly of any unauthorised use.
        </p>
      </>
    ),
  },
  {
    id: "roles",
    heading: "Roles on the platform",
    body: (
      <>
        <p>INSPECTRA supports three roles, each with different responsibilities:</p>
        <ul>
          <li>
            <strong>Seekers</strong> browse listings, save properties, and request
            inspections.
          </li>
          <li>
            <strong>Realtors</strong> must complete certification before listing, and are
            responsible for the accuracy and legality of what they publish.
          </li>
          <li>
            <strong>Administrators</strong> review submissions, manage verification status,
            and moderate the platform.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "listings",
    heading: "Listings and verification status",
    body: (
      <>
        <p>
          Each listing carries a status of Verified, Pending, or Disputed. Realtors must
          submit accurate documents and details. Misrepresenting a property, its documents,
          or its fees may result in a listing being removed and an account suspended.
        </p>
        <p>
          A Pending or Disputed status does not imply wrongdoing; it means review is ongoing
          or a concern has been raised.
        </p>
      </>
    ),
  },
  {
    id: "certification",
    heading: "Realtor certification",
    body: (
      <p>
        Realtors are certified through INSPECTRA's enablement program. Certification reflects
        completion of that program and does not constitute a professional license,
        endorsement, or warranty of any individual's conduct. You can read more on the{" "}
        <Link to="/enablement">Get Certified</Link> page.
      </p>
    ),
  },
  {
    id: "fees",
    heading: "Fees and payments",
    body: (
      <p>
        INSPECTRA may charge for realtor subscriptions, certification, and per-inspection
        fees, as described on the <Link to="/pricing">Pricing</Link> page. Applicable fees,
        billing cycles, and any taxes are shown before you commit to a paid plan. Where
        payment processing is not yet enabled, no charges are taken.
      </p>
    ),
  },
  {
    id: "conduct",
    heading: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Post false, misleading, duplicate, or fraudulent listings.</li>
          <li>Impersonate another person or misrepresent your affiliation.</li>
          <li>Attempt to bypass verification, scrape the platform, or disrupt its operation.</li>
          <li>Use INSPECTRA for any unlawful purpose or to harass other users.</li>
        </ul>
      </>
    ),
  },
  {
    id: "content",
    heading: "Content and intellectual property",
    body: (
      <p>
        You retain ownership of the content you submit, and grant INSPECTRA a licence to host
        and display it for the operation of the platform. The INSPECTRA name, logo, and
        interface are our property and may not be used without permission.
      </p>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers and limitation of liability",
    body: (
      <p>
        INSPECTRA is provided on an "as is" and "as available" basis. To the fullest extent
        permitted by law, we are not liable for losses arising from your reliance on any
        listing, verification status, or realtor. Always confirm title and documents
        independently before completing a transaction.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Suspension and termination",
    body: (
      <p>
        We may suspend or terminate access to accounts that violate these terms or put other
        users at risk. You may close your account at any time from your settings.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Governing law and changes",
    body: (
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria. We may
        update these terms from time to time; material changes will be signalled by updating
        the date above. Continued use after an update means you accept the revised terms.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    body: (
      <p>
        Questions about these terms? Reach us at{" "}
        <a href="mailto:legal@inspectra.ng">legal@inspectra.ng</a>.
      </p>
    ),
  },
];

export function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="10 July 2026"
      intro="These terms explain the rules for using INSPECTRA, what you can expect from us, and what we expect from you. Please read them carefully."
      sections={SECTIONS}
    />
  );
}
