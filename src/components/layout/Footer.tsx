import { Link } from "react-router";
import logo from "@/assets/inspectra-logo-primary-lg.png";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "All listings", to: "/listings" },
      { label: "Top verified", to: "/listings?sort=verified" },
      { label: "Realtors", to: "/realtors" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "For realtors",
    links: [
      { label: "Get certified", to: "/enablement" },
      { label: "List a property", to: "/register" },
      { label: "Subscription plans", to: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About INSPECTRA", to: "/about" },
      { label: "How verification works", to: "/about#verification" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-surface-2/50">
      <Container className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 py-16 max-lg:grid-cols-2 max-lg:gap-10 max-sm:grid-cols-1 max-sm:py-12">
        <div className="space-y-5 max-lg:col-span-2 max-sm:col-span-1">
          <img src={logo} alt="INSPECTRA" className="h-10 w-auto" />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Verified homes and certified realtors, so every step of your search is one you
            can trust.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-faint">
              {col.title}
            </h3>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-line">
        <Container className="flex items-center justify-between gap-3 py-6 text-xs text-faint max-sm:flex-col">
          <p>© {new Date().getFullYear()} INSPECTRA Real Estate Technologies Ltd.</p>
          <p className="font-display italic">Trust, built into every address.</p>
        </Container>
      </div>
    </footer>
  );
}
