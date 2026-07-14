import logoLight from "@/assets/inspectra-logo-primary-lg.png";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { savedPropertyIds, seeker, upcomingInspections } from "@/data/seeker";
import { cn } from "@/lib/cn";
import {
  ArrowUpRight,
  CalendarCheck,
  Heart,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import { Link, NavLink } from "react-router";

type NavItem = {
  label: string;
  to: string;
  Icon: LucideIcon;
  end?: boolean;
  count?: number;
};

const NAV: NavItem[] = [
  { label: "Overview", to: "/dashboard", Icon: LayoutDashboard, end: true },
  {
    label: "Saved homes",
    to: "/dashboard/saved",
    Icon: Heart,
    count: savedPropertyIds.length,
  },
  { label: "Inquiries", to: "/dashboard/inquiries", Icon: MessageSquare },
  {
    label: "Inspections",
    to: "/dashboard/inspections",
    Icon: CalendarCheck,
    count: upcomingInspections.length,
  },
  { label: "Account", to: "/dashboard/account", Icon: UserCircle },
];

/** Sidebar content, shared by the desktop rail and the mobile drawer. */
export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col p-5">
      <Link
        to="/"
        className="flex items-center px-1"
        aria-label="INSPECTRA home"
        onClick={onNavigate}
      >
        <img src={logoLight} alt="INSPECTRA" className="h-10 w-auto" />
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ label, to, Icon, end, count }) => (
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
            {count != null && count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand/15 px-1.5 text-xs font-semibold tabular-nums text-brand-ink">
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/listings"
        onClick={onNavigate}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
      >
        Browse listings
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>

      <div className="mt-auto space-y-4 pt-6">
        <ThemeToggle className="w-full justify-center" />
        <Link
          to="/dashboard/account"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition-colors hover:bg-surface-2"
        >
          <img
            src={seeker.avatar}
            alt={seeker.name}
            className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {seeker.name}
            </p>
            <p className="truncate text-xs text-faint">{seeker.email}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
