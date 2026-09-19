import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Building2,
  Users,
  BadgeCheck,
  Tag,
  Info,
} from "lucide-react";
import logo from "@/assets/inspectra-logo-primary-lg.png";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";
import { homeFor, useMe } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

// Icons are drawer-only: the desktop nav is text.
const NAV = [
  { label: "Listings", to: "/listings", Icon: Building2 },
  { label: "Realtors", to: "/realtors", Icon: Users },
  { label: "Get Certified", to: "/enablement", Icon: BadgeCheck },
  { label: "Pricing", to: "/pricing", Icon: Tag },
  { label: "About", to: "/about", Icon: Info },
];

export function Header() {
  const { data: user, isPending } = useMe();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the drawer is open it owns the screen: the page behind it holds still
  // and Escape closes it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The header is transparent on every page until you scroll (or open the menu).
  // White nav is only used while floating over a dark hero/intro.
  const hasDarkHero =
    pathname === "/" ||
    pathname === "/realtors" ||
    pathname === "/listings" ||
    pathname === "/enablement" ||
    pathname === "/pricing" ||
    pathname === "/about";
  const solid = scrolled || open;
  const onDarkHero = hasDarkHero && !solid;

  return (
    <>
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
          {!isPending &&
            (user ? (
              <>
                <Link
                  to={homeFor(user.role)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
                    onDarkHero
                      ? "text-white/80 hover:text-white"
                      : "text-muted hover:text-ink",
                  )}
                >
                  <LayoutDashboard className="size-4" aria-hidden />
                  Dashboard
                </Link>
                <LogoutButton
                  className={cn(
                    "w-auto px-0 py-0 hover:bg-transparent",
                    onDarkHero
                      ? "text-white/80 hover:text-white"
                      : "text-muted hover:text-ink",
                  )}
                />
              </>
            ) : (
              <>
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
              </>
            ))}
        </div>

        {/* mobile cluster */}
        <div className="hidden items-center gap-3 max-lg:flex">
          <ThemeToggle onDark={onDarkHero} />
          <button
            type="button"
            className={cn(
              "-mr-2 grid size-11 place-items-center rounded-full transition-colors",
              onDarkHero
                ? "text-white hover:bg-white/10"
                : "text-ink hover:bg-surface-2",
            )}
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </Container>
    </header>

      {/* Mobile drawer. It lives OUTSIDE <header> on purpose: the header's
          backdrop-blur makes it the containing block for fixed children, which
          clipped the panel to the 4rem header bar. */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-60 hidden bg-[#04121f]/60 backdrop-blur-[2px] max-lg:block"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-70 hidden w-[19.5rem] max-w-[86vw] flex-col border-r border-line bg-surface shadow-[0_0_70px_-10px_rgba(4,18,31,0.55)] max-lg:flex"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line pl-5 pr-3">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center"
                  aria-label="INSPECTRA home"
                >
                  <img src={logo} alt="INSPECTRA" className="h-9 w-auto" />
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.95rem] font-medium transition-colors",
                        isActive
                          ? "bg-brand/10 text-brand-ink"
                          : "text-muted hover:bg-surface-2 hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.Icon
                          className={cn(
                            "size-4.5 shrink-0",
                            !isActive && "text-faint",
                          )}
                          strokeWidth={2}
                          aria-hidden
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {!isPending && (
                <div className="shrink-0 border-t border-line p-4">
                  {user ? (
                    <div className="grid gap-2">
                      <Link
                        to={homeFor(user.role)}
                        onClick={() => setOpen(false)}
                        className={buttonClasses("brand", "md")}
                      >
                        <LayoutDashboard className="size-4" aria-hidden />
                        Dashboard
                      </Link>
                      <LogoutButton
                        onNavigate={() => setOpen(false)}
                        className={buttonClasses("outline", "md")}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className={buttonClasses("brand", "md")}
                      >
                        <UserPlus className="size-4" aria-hidden />
                        Sign up
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className={buttonClasses("outline", "md")}
                      >
                        <LogIn className="size-4" aria-hidden />
                        Log in
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
