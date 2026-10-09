import { Link } from "react-router";
import logo from "@/assets/inspectra-logo-primary-lg.png";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Request a property", to: "/request" },
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
          <a
            href="https://linkedin.com/company/inspectraproptech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.06c.53-.95 1.84-1.96 3.78-1.96 4.04 0 4.79 2.54 4.79 5.85V21h-4v-5.66c0-1.35-.03-3.09-1.94-3.09-1.94 0-2.24 1.47-2.24 2.99V21h-4V9Z" />
            </svg>
            <span className="sr-only">INSPECTRA on LinkedIn</span>
          </a>
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
