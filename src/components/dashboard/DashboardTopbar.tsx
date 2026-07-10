import { Link, useLocation } from "react-router";
import { Menu, Bell } from "lucide-react";
import { seeker } from "@/data/seeker";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/saved": "Saved homes",
  "/dashboard/inquiries": "Inquiries",
  "/dashboard/inspections": "Inspections",
  "/dashboard/account": "Account",
};

/** Sticky top bar: mobile menu trigger, page title, notifications, avatar. */
export function DashboardTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-8 max-lg:px-6 max-sm:px-5">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="hidden text-ink max-lg:inline-flex"
        >
          <Menu className="size-6" />
        </button>

        <h1 className="text-lg font-semibold text-ink max-lg:hidden">{title}</h1>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink"
          >
            <Bell className="size-4.5" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-surface" />
          </button>

          <Link
            to="/dashboard/account"
            aria-label="Account"
            className="shrink-0"
          >
            <img
              src={seeker.avatar}
              alt={seeker.name}
              className="size-10 rounded-full object-cover ring-1 ring-line transition-shadow hover:ring-brand/40"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
