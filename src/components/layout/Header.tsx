import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ClipboardList,
  BadgeCheck,
  Tag,
  Info,
  ChevronDown,
  Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "@/assets/inspectra-logo-primary-lg.png";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { cn } from "@/lib/cn";
import { homeFor, useMe } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface NavLinkItem {
  label: string;
  to: string;
  Icon: LucideIcon;
  hint?: string;
}

interface NavGroup {
  label: string;
  items: NavLinkItem[];
}

const REALTORS: NavGroup = {
  label: "Realtors",
  // "Find a realtor" returns with the /realtors directory when listings open.
  items: [
    {
      label: "Join as a realtor",
      to: "/for-realtors",
      Icon: Handshake,
      hint: "List with INSPECTRA and grow your business",
    },
    {
      label: "Get Certified",
      to: "/enablement",
      Icon: BadgeCheck,
      hint: "Earn the certified badge buyers look for",
    },
    {
      label: "Pricing",
      to: "/pricing",
      Icon: Tag,
      hint: "Realtor plans and what each one includes",
    },
  ],
};

// Icons are drawer-only in the top-level desktop nav, which is text.
const NAV: (NavLinkItem | NavGroup)[] = [
  { label: "Request a property", to: "/request", Icon: ClipboardList },
  REALTORS,
  { label: "About", to: "/about", Icon: Info },
];

const isGroup = (item: NavLinkItem | NavGroup): item is NavGroup => "items" in item;

export function Header() {
  const { data: user, isPending } = useMe();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
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
    pathname === "/about" ||
    pathname === "/for-realtors";
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
          {NAV.map((item) => {
            const pill = (isActive: boolean) =>
              cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors max-xl:px-3",
                isActive
                  ? onDarkHero
                    ? "bg-white/15 text-white"
                    : "bg-surface-2 text-ink"
                  : onDarkHero
                    ? "text-white/75 hover:bg-white/10 hover:text-white"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
              );

            if (!isGroup(item)) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => pill(isActive)}
                >
                  {item.label}
                </NavLink>
              );
            }

            const groupActive = item.items.some(
              (link) => pathname === link.to || pathname.startsWith(`${link.to}/`),
            );
            return (
              <Popover
                key={item.label}
                open={menu === item.label}
                onOpenChange={(next) => setMenu(next ? item.label : null)}
              >
                <PopoverTrigger
                  className={cn(pill(groupActive), "inline-flex items-center gap-1")}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      menu === item.label && "rotate-180",
                    )}
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </PopoverTrigger>
                <PopoverContent align="center" sideOffset={10} className="w-72 p-2">
                  {item.items.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenu(null)}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-start gap-3 rounded-lg p-3 transition-colors duration-200",
                          isActive ? "bg-brand/12" : "hover:bg-brand/15",
                        )
                      }
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand-ink transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
                        <link.Icon className="size-4.5" strokeWidth={2} aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-brand-ink">
                          {link.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted">
                          {link.hint}
                        </span>
                      </span>
                    </NavLink>
                  ))}
                </PopoverContent>
              </Popover>
            );
          })}
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
                {NAV.map((entry) =>
                  isGroup(entry) ? (
                    <div key={entry.label} className="space-y-1 py-2">
                      <p className="px-3 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
                        {entry.label}
                      </p>
                      {entry.items.map((item) => (
                        <DrawerLink key={item.to} item={item} onNavigate={() => setOpen(false)} />
                      ))}
                    </div>
                  ) : (
                    <DrawerLink key={entry.to} item={entry} onNavigate={() => setOpen(false)} />
                  ),
                )}
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

function DrawerLink({
  item,
  onNavigate,
}: {
  item: NavLinkItem;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
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
            className={cn("size-4.5 shrink-0", !isActive && "text-faint")}
            strokeWidth={2}
            aria-hidden
          />
          {item.label}
        </>
      )}
    </NavLink>
  );
}
