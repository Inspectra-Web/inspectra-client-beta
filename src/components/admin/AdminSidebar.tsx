import logoPrimary from "@/assets/inspectra-logo-primary-lg.png";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { queueCount } from "@/data/admin";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuthUser } from "@/lib/auth";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  BadgeCheck,
  Building2,
  LayoutDashboard,
  type LucideIcon,
  ShieldCheck,
  UserCircle,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Link, NavLink } from "react-router";

type NavItem = { label: string; to: string; Icon: LucideIcon; end?: boolean };
type NavGroup = { label: string; items: NavItem[] };

// Grouped so trust operations read as the heart of the console, not a flat list of pages.
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Command",
    items: [{ label: "Overview", to: "/admin", Icon: LayoutDashboard, end: true }],
  },
  {
    label: "Trust operations",
    items: [
      { label: "Verification", to: "/admin/verification", Icon: ShieldCheck },
      { label: "Realtors", to: "/admin/realtors", Icon: BadgeCheck },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Listings", to: "/admin/listings", Icon: Building2 },
      { label: "Users", to: "/admin/users", Icon: UsersRound },
      { label: "Payments", to: "/admin/payments", Icon: Wallet },
    ],
  },
  {
    label: "System",
    items: [{ label: "Account", to: "/admin/account", Icon: UserCircle }],
  },
] as const;

/** Sidebar content, shared by the desktop rail and the mobile drawer. */
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthUser();
  const name = displayName(user.fullname);

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

      <p className="mt-3 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
        Trust Operations
      </p>

      <nav className="scrollbar-slim mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
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
                {/* live queue badge on Verification */}
                {to === "/admin/verification" && queueCount > 0 && (
                  <span className="rounded-full bg-gold/15 px-1.5 text-xs font-semibold tabular-nums text-gold">
                    {queueCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <Link
        to="/admin/verification"
        onClick={onNavigate}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
      >
        <ShieldCheck className="size-4" aria-hidden />
        Review queue
        {queueCount > 0 && (
          <span className="rounded-full bg-[#04121f]/15 px-1.5 text-xs tabular-nums">
            {queueCount}
          </span>
        )}
      </Link>

      <div className="mt-4 space-y-4 pt-2">
        <ThemeToggle className="w-full justify-center" />
        <Link
          to="/admin/account"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition-colors hover:bg-surface-2"
        >
          <UserAvatar name={name} avatar={user.avatar} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-faint">{user.email}</p>
          </div>
        </Link>
        <LogoutButton onNavigate={onNavigate} to="/admin/login" />
      </div>
    </div>
  );
}
