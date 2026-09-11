import { Link } from "react-router";
import { ArrowUpRight, Building2 } from "lucide-react";
import type { ListingFor, VerificationStatus } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { buttonClasses } from "@/components/ui/Button";
import { formatPriceFull } from "@/lib/format";
import { priceSuffix } from "@/lib/listing";

/**
 * Compact property card for the detail-page aside.
 *
 * Takes the fields it renders rather than a whole property: a real listing is
 * addressed by slug and a mock one by id, and the mock type carries a dozen fields
 * this card never touches. `href` is therefore the caller's to build.
 */
export function PropertySummary({
  image,
  title,
  location,
  price,
  listingFor,
  status,
  href,
}: {
  image: string;
  title: string;
  location: string;
  price: number;
  listingFor: ListingFor;
  status: VerificationStatus;
  href: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative aspect-16/10">
        {image ? (
          <img src={image} alt={title} className="size-full object-cover" />
        ) : (
          // A listing with no photo yet still needs a tile, or the card collapses.
          <div className="grid size-full place-items-center bg-surface-2 text-faint">
            <Building2 className="size-7" aria-hidden />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <ListingIntentBadge listingFor={listingFor} onPhoto />
          {status === "verified" && <StatusBadge status="verified" onPhoto />}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
          The property
        </p>
        <h3 className="mt-1.5 line-clamp-1 font-semibold text-ink">{title}</h3>
        <p className="line-clamp-1 text-sm text-muted">{location}</p>
        <p className="mt-2 font-semibold text-ink">
          {formatPriceFull(price)}
          {priceSuffix(listingFor) && (
            <span className="font-normal text-muted"> {priceSuffix(listingFor)}</span>
          )}
        </p>
        <Link to={href} className={buttonClasses("outline", "sm", "mt-4 w-full")}>
          <ArrowUpRight className="size-4" aria-hidden />
          View listing
        </Link>
      </div>
    </div>
  );
}
