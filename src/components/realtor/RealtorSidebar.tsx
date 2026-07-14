import logoPrimary from "@/assets/inspectra-logo-primary-lg.png";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { realtor } from "@/data/realtor";
import { cn } from "@/lib/cn";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Plus,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { Link, NavLink } from "react-router";

type NavItem = { label: string; to: string; Icon: LucideIcon; end?: boolean };
type NavGroup = { label: string; items: NavItem[] };

// Grouped so trust is a first-class part of the realtor's workspace, not buried in a flat list.
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Overview", to: "/realtor", Icon: LayoutDashboard, end: true },
      { label: "Listings", to: "/realtor/listings", Icon: Building2 },
      { label: "Leads", to: "/realtor/leads", Icon: Inbox },
      { label: "Inspections", to: "/realtor/inspections", Icon: CalendarCheck },
    ],
  },
  {
    label: "Standing",
    items: [
      { label: "Verification", to: "/realtor/verification", Icon: ShieldCheck },
      { label: "Certification", to: "/realtor/certification", Icon: BadgeCheck },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Account", to: "/realtor/account", Icon: UserCircle },
    ],
  },
] as const;

/** Sidebar content, shared by the desktop rail and the mobile drawer. */
export function RealtorSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col p-5">
      <Link
        to="/"
        className="flex items-center px-1"
        aria-label="INSPECTRA home"
        onClick={onNavigate}
      >
        <img src={logoPrimary} alt="INSPECTRA" className="h-10 w-auto" />
      </Link>

      <nav className="scrollbar-slim mt-8 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
              {group.label}
            </p>
            {group.items.map(({ label, to, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-2 text-ink"
                      : "text-muted hover:bg-surface-2 hover:text-ink",
                  )
                }
              >
                <Icon className="size-4.5 shrink-0" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <Link
        to="/realtor/listings/new"
        onClick={onNavigate}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
      >
        <Plus className="size-4" aria-hidden />
        New listing
      </Link>

      <div className="mt-4 space-y-4 pt-2">
        <ThemeToggle className="w-full justify-center" />
        <Link
          to="/realtor/account"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition-colors hover:bg-surface-2"
        >
          <img
            src={realtor.avatar}
            alt={realtor.name}
            className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{realtor.name}</p>
            <p className="truncate text-xs text-faint">{realtor.agency}</p>
          </div>
          {realtor.certified && (
            // Signature credential moment: a hairline foil ring (the one place foil is allowed).
            <span
              className="grid size-6 shrink-0 place-items-center rounded-full bg-foil p-px"
              title="Certified realtor"
              aria-label="Certified realtor"
            >
              <span className="grid size-full place-items-center rounded-full bg-surface">
                <BadgeCheck className="size-3.5 text-foil" aria-hidden />
              </span>
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
