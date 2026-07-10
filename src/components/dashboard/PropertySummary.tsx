import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import type { Property } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonClasses } from "@/components/ui/Button";
import { formatPriceFull } from "@/lib/format";

/** Compact property card for the detail-page aside. Links out to the full listing. */
export function PropertySummary({ property }: { property: Property }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative aspect-16/10">
        <img
          src={property.image}
          alt={property.title}
          className="size-full object-cover"
        />
        {property.status === "verified" && (
          <StatusBadge status="verified" onPhoto className="absolute left-3 top-3" />
        )}
      </div>
      <div className="p-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
          The property
        </p>
        <h3 className="mt-1.5 line-clamp-1 font-semibold text-ink">{property.title}</h3>
        <p className="line-clamp-1 text-sm text-muted">
          {property.location}, {property.city}
        </p>
        <p className="mt-2 font-semibold text-ink">
          {formatPriceFull(property.price)}
          {property.listingFor === "rent" && (
            <span className="font-normal text-muted"> /yr</span>
          )}
        </p>
        <Link
          to={`/listings/${property.id}`}
          className={buttonClasses("outline", "sm", "mt-4 w-full")}
        >
          <ArrowUpRight className="size-4" aria-hidden />
          View listing
        </Link>
      </div>
    </div>
  );
}
