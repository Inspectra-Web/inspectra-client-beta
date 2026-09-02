import { Link, useLocation } from "react-router";
import { Menu, Bell } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuthUser } from "@/lib/auth";
import { displayName } from "@/lib/format";

const TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/verification": "Verification",
  "/admin/realtors": "Realtors",
  "/admin/listings": "Listings",
  "/admin/users": "Users",
  "/admin/payments": "Payments",
  "/admin/account": "Account",
};

/** Sticky top bar: mobile menu trigger, page title, notifications, avatar. */
export function AdminTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const user = useAuthUser();
  const { pathname } = useLocation();
  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/admin/verification")
      ? "Verification"
      : pathname.startsWith("/admin/realtors")
        ? "Realtors"
        : pathname.startsWith("/admin/listings")
          ? "Listings"
          : pathname.startsWith("/admin/users")
            ? "Users"
            : "Admin");

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

          <Link to="/admin/account" aria-label="Account" className="shrink-0">
            <UserAvatar
              name={displayName(user.fullname)}
              avatar={user.avatar}
              className="size-10 transition-shadow hover:ring-brand/40"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
