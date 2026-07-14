import { Link, useLocation } from "react-router";
import { Menu, Bell, Plus } from "lucide-react";
import { realtor } from "@/data/realtor";

const TITLES: Record<string, string> = {
  "/realtor": "Overview",
  "/realtor/listings": "Listings",
  "/realtor/leads": "Leads",
  "/realtor/inspections": "Inspections",
  "/realtor/verification": "Verification",
  "/realtor/certification": "Certification",
  "/realtor/account": "Account",
};

/** Sticky top bar: mobile menu trigger, page title, new-listing action, notifications, avatar. */
export function RealtorTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const title = pathname.endsWith("/listings/new")
    ? "New listing"
    : pathname.endsWith("/edit")
      ? "Edit listing"
      : TITLES[pathname] ?? "Dashboard";

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

        <h1 className="text-lg font-semibold text-ink max-lg:hidden">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/realtor/listings/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:size-10 max-sm:justify-center max-sm:px-0"
            aria-label="New listing"
          >
            <Plus className="size-4" aria-hidden />
            <span className="max-sm:hidden">New listing</span>
          </Link>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink"
          >
            <Bell className="size-4.5" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-surface" />
          </button>

          <Link to="/realtor/account" aria-label="Account" className="shrink-0">
            <img
              src={realtor.avatar}
              alt={realtor.name}
              className="size-10 rounded-full object-cover ring-1 ring-line transition-shadow hover:ring-brand/40"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
