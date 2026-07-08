import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import logoPrimary from "@/assets/inspectra-logo-primary-lg.png";
import logoWhite from "@/assets/inspectra-logo-white-lg.png";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Listings", to: "/listings" },
  { label: "Realtors", to: "/realtors" },
  { label: "Get Certified", to: "/enablement" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

function Logo() {
  return (
    <>
      <img src={logoPrimary} alt="INSPECTRA" className="h-7 w-auto dark:hidden" />
      <img
        src={logoWhite}
        alt="INSPECTRA"
        className="hidden h-7 w-auto dark:block"
      />
    </>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center" aria-label="INSPECTRA home">
          <Logo />
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-2 text-sm transition-colors",
                  isActive ? "text-ink" : "text-muted hover:text-ink",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link to="/login" className={buttonClasses("ghost", "sm")}>
            Log in
          </Link>
          <Link to="/register" className={buttonClasses("primary", "sm")}>
            Sign up
          </Link>
        </div>

        {/* mobile toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="text-ink"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>

      {/* mobile drawer */}
      {open && (
        <div className="border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-sm",
                    isActive ? "bg-surface-2 text-ink" : "text-muted",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={buttonClasses("outline", "md")}
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className={buttonClasses("primary", "md")}
              >
                Sign up
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
