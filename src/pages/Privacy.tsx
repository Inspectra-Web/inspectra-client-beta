import { Link } from "react-router";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

const SECTIONS: LegalSection[] = [
  {
    id: "intro",
    heading: "Introduction",
    body: (
      <p>
        This Privacy Policy explains how INSPECTRA collects, uses, and protects your personal
        information when you use our real estate platform. We are committed to handling your
        data responsibly and in line with applicable Nigerian data protection law, including
        the Nigeria Data Protection Act.
      </p>
    ),
  },
  {
    id: "collect",
    heading: "Information we collect",
    body: (
      <>
        <p>We collect information you provide and information generated as you use INSPECTRA:</p>
        <ul>
          <li>
            <strong>Account details</strong> such as your name, email, phone number, and role.
          </li>
          <li>
            <strong>Listing information</strong> submitted by realtors, including property
            details, photos, and supporting documents.
          </li>
          <li>
            <strong>Usage data</strong> such as pages viewed, searches, and saved properties.
          </li>
          <li>
            <strong>Device and log data</strong> such as your IP address and browser type.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    heading: "How we use your information",
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Operate the platform and show you relevant listings and realtors.</li>
          <li>Verify properties and certify realtors.</li>
          <li>Process inspections, subscriptions, and certification where applicable.</li>
          <li>Keep INSPECTRA secure and prevent fraud or misuse.</li>
          <li>Communicate with you about your account and activity.</li>
        </ul>
      </>
    ),
  },
  {
    id: "documents",
    heading: "Verification documents",
    body: (
      <p>
        To support our dual-verification model, realtors submit documents such as titles,
        Certificates of Occupancy, and survey plans. These are used solely to assess a
        listing's verification status and are handled with restricted access. We do not sell
        these documents or use them for unrelated purposes.
      </p>
    ),
  },
  {
    id: "sharing",
    heading: "How we share information",
    body: (
      <>
        <p>We do not sell your personal information. We share it only where necessary:</p>
        <ul>
          <li>
            With <strong>other users</strong> as needed to connect seekers and realtors (for
            example, showing a realtor's public profile).
          </li>
          <li>
            With <strong>service providers</strong> who help us operate the platform, under
            confidentiality obligations.
          </li>
          <li>
            With <strong>authorities</strong> where required by law or to protect our users.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and tracking",
    body: (
      <p>
        We use cookies and similar technologies to keep you signed in, remember your
        preferences (such as theme), and understand how the platform is used. You can control
        cookies through your browser settings, though some features may not work without them.
      </p>
    ),
  },
  {
    id: "retention",
    heading: "Data retention",
    body: (
      <p>
        We keep your information for as long as your account is active and as needed to
        provide the service, resolve disputes, and meet legal obligations. When it is no
        longer required, we delete or anonymise it.
      </p>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <p>
        We use technical and organisational measures to protect your information, including
        access controls and encryption in transit. No system is perfectly secure, so we
        cannot guarantee absolute security, but we work continuously to safeguard your data.
      </p>
    ),
  },
  {
    id: "rights",
    heading: "Your rights",
    body: (
      <>
        <p>Subject to applicable law, you have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request deletion of your information.</li>
          <li>Object to or restrict certain processing.</li>
        </ul>
        <p>
          To exercise these rights, contact us using the details below. You can also update
          much of your information directly from your account settings.
        </p>
      </>
    ),
  },
  {
    id: "children",
    heading: "Children",
    body: (
      <p>
        INSPECTRA is not intended for anyone under 18. We do not knowingly collect personal
        information from children.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the platform evolves. Material changes will be signalled
        by updating the date above. We encourage you to review this page periodically. See
        also our <Link to="/terms">Terms of Service</Link>.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    body: (
      <p>
        For any privacy questions or requests, reach our team at{" "}
        <a href="mailto:privacy@inspectra.ng">privacy@inspectra.ng</a>.
      </p>
    ),
  },
];

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="10 July 2026"
      intro="Your trust matters to us. This policy describes what information INSPECTRA collects, how we use it, and the choices you have."
      sections={SECTIONS}
    />
  );
}
