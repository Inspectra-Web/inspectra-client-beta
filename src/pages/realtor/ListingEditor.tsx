import { Link, useParams } from "react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { ListingForm } from "@/components/realtor/ListingForm";
import { apiMessage } from "@/lib/api";
import { useMyListing } from "@/lib/properties";

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

function NotFound({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <Building2 className="size-7" />
      </span>
      <h1 className="display mt-5 text-3xl text-ink">Listing not found</h1>
      <p className="mt-2 text-muted">{message}</p>
      <Link to="/realtor/listings" className={buttonClasses("brand", "md", "mt-7")}>
        <ArrowLeft className="size-4" aria-hidden />
        Back to listings
      </Link>
    </div>
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

/** Edit an existing listing, prefilled from what the API holds. */
export function RealtorListingEdit() {
  const { id = "" } = useParams();
  const { data: listing, isPending, isError, error } = useMyListing(id);

  if (isPending)
    return (
      <div className="space-y-5">
        <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
        <div className="h-[38rem] animate-pulse rounded-3xl bg-surface-2" />
      </div>
    );

  if (isError || !listing)
    return <NotFound message={apiMessage(error, "This listing may have been removed.")} />;

  return (
    <div className="space-y-5">
      <BackLink to={`/realtor/listings/${listing.id}`} label="Back to listing" />
      <Reveal>
        <ListingForm mode="edit" initial={listing} />
      </Reveal>
    </div>
  );
}
