import { Link, useParams } from "react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { ListingForm } from "@/components/realtor/ListingForm";
import { propertyById } from "@/data/mock";

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

/** Create a new listing (guided composer carries its own heading). */
export function RealtorListingNew() {
  return (
    <div className="space-y-5">
      <BackLink to="/realtor/listings" label="Back to listings" />
      <Reveal>
        <ListingForm mode="new" />
      </Reveal>
    </div>
  );
}

/** Edit an existing listing, prefilled from the marketplace property. */
export function RealtorListingEdit() {
  const { id } = useParams();
  const property = id ? propertyById(id) : undefined;

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Building2 className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Listing not found</h1>
        <p className="mt-2 text-muted">This listing may have been removed.</p>
        <Link to="/realtor/listings" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <BackLink to={`/realtor/listings/${property.id}`} label="Back to listing" />
      <Reveal>
        <ListingForm mode="edit" initial={property} />
      </Reveal>
    </div>
  );
}
