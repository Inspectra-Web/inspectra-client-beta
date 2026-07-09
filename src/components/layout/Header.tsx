import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import logo from "@/assets/inspectra-logo-primary-lg.png";
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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The header is transparent on every page until you scroll (or open the menu).
  // White nav is only used while floating over a dark hero/intro.
  const hasDarkHero = pathname === "/" || pathname === "/realtors" || pathname === "/listings";
  const solid = scrolled || open;
  const onDarkHero = hasDarkHero && !solid;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid ? "bg-bg/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center" aria-label="INSPECTRA home">
          <img src={logo} alt="INSPECTRA" className="h-10 w-auto" />
        </Link>

        {/* desktop nav */}
        <nav className="flex items-center gap-1 max-lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors max-xl:px-3",
                  isActive
                    ? onDarkHero
                      ? "bg-white/15 text-white"
                      : "bg-surface-2 text-ink"
                    : onDarkHero
                      ? "text-white/75 hover:bg-white/10 hover:text-white"
                      : "text-muted hover:bg-surface-2 hover:text-ink",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* desktop actions */}
        <div className="flex items-center gap-3 max-lg:hidden">
          <ThemeToggle onDark={onDarkHero} />
          <Link
            to="/login"
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
              onDarkHero
                ? "text-white/80 hover:text-white"
                : "text-muted hover:text-ink",
            )}
          >
            <LogIn className="size-4" aria-hidden />
            Log in
          </Link>
          <Link to="/register" className={buttonClasses("brand", "sm")}>
            <UserPlus className="size-4" aria-hidden />
            Sign up
          </Link>
        </div>

        {/* mobile cluster */}
        <div className="hidden items-center gap-3 max-lg:flex">
          <ThemeToggle onDark={onDarkHero} />
          <button
            type="button"
            className={onDarkHero ? "text-white" : "text-ink"}
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
        <div className="hidden border-b border-line bg-bg/95 backdrop-blur-xl max-lg:block">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
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
                <LogIn className="size-4" aria-hidden />
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className={buttonClasses("brand", "md")}
              >
                <UserPlus className="size-4" aria-hidden />
                Sign up
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
