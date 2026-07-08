import { Link } from "react-router";
import logoPrimary from "@/assets/inspectra-logo-primary-lg.png";
import logoWhite from "@/assets/inspectra-logo-white-lg.png";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

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
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* brand + newsletter */}
        <div className="space-y-5">
          <img
            src={logoPrimary}
            alt="INSPECTRA"
            className="h-7 w-auto dark:hidden"
          />
          <img
            src={logoWhite}
            alt="INSPECTRA"
            className="hidden h-7 w-auto dark:block"
          />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Verified homes and certified realtors — so every step of your search is one
            you can trust.
          </p>
          <form
            className="flex max-w-sm gap-2"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Newsletter signup"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="h-10 w-full rounded-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-faint focus:border-brand/60 focus:outline-none"
            />
            <Button size="sm" type="submit">
              Notify me
            </Button>
          </form>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-widest text-faint">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
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
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} INSPECTRA Real Estate Technologies Ltd.</p>
          <p>A home you can trust, start to finish.</p>
        </Container>
      </div>
    </footer>
  );
}
