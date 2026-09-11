import { Link } from "react-router";
import { ArrowUpRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Compact realtor card for the detail-page aside. Trust-ranked, no score shown.
 *
 * Takes the fields it renders: it used to append Unsplash sizing params to the avatar,
 * which mangles a Cloudinary URL, so any resizing is the caller's business now.
 */
export function RealtorSummary({
  name,
  avatar,
  agency,
  city,
  certified,
  href,
}: {
  name: string;
  avatar: string;
  agency: string;
  city: string;
  certified: boolean;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
        Listed by
      </p>
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <UserAvatar name={name} avatar={avatar} className="size-11" />
          {certified && (
            <BadgeCheck
              className="absolute -bottom-0.5 -right-0.5 size-4 fill-verified text-white"
              aria-hidden
            />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{name}</p>
          {agency && <p className="truncate text-sm text-muted">{agency}</p>}
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
        <ShieldCheck className="size-4 text-verified" aria-hidden />
        Trust-ranked realtor{city && `, ${city}`}
      </p>
      <Link to={href} className={buttonClasses("outline", "sm", "mt-4 w-full")}>
        <ArrowUpRight className="size-4" aria-hidden />
        View profile
      </Link>
    </div>
  );
}
