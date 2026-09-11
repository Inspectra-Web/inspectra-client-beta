import { Link } from "react-router";
import { Heart, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useSavedIds } from "@/lib/saved";
import { usePublicListings, toCardListing, EMPTY_QUERY } from "@/lib/marketplace";

// A shortlist is small, and paging one would be strange. One page, generously sized.
const SAVED_MAX = 48;

export function Saved() {
  const { ids, isPending: idsPending, isError: idsError, error: idsErr } = useSavedIds();

  // The cards come from the browse endpoint, filtered to the saved ids, so this page
  // renders exactly what the marketplace renders and inherits its public gate: a saved
  // listing whose realtor was suspended quietly drops out instead of 404ing a card.
  const { data, isPending, isError, error } = usePublicListings(
    { ...EMPTY_QUERY, ids },
    SAVED_MAX,
    ids.length > 0,
  );

  const loading = idsPending || (ids.length > 0 && isPending);
  const listings = ids.length > 0 ? (data?.listings ?? []) : [];

  // Removing is the card's own heart, so this page needs no Remove button of its own:
  // the card leaves the grid when the shortlist it is drawn from changes.
  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Saved homes"
          subtitle={
            listings.length
              ? `${listings.length} home${listings.length === 1 ? "" : "s"} you're keeping an eye on`
              : "Your shortlist lives here"
          }
        />
      </Reveal>

      {idsError || isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={Heart}
            title="Could not load your shortlist"
            message={apiMessage(idsErr ?? error)}
          />
        </Reveal>
      ) : loading ? (
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[10/9] animate-pulse rounded-2xl bg-surface-2" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      ) : listings.length ? (
        <Reveal
          className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1"
          y={16}
        >
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={toCardListing(listing)} />
          ))}
        </Reveal>
      ) : (
        <Reveal y={16}>
          <EmptyState
            icon={Heart}
            title="No saved homes yet"
            message="Tap the heart on any listing to keep it here and compare at your own pace."
            action={
              <Link to="/listings" className={buttonClasses("brand", "md")}>
                <Search className="size-4" aria-hidden />
                Browse listings
              </Link>
            }
          />
        </Reveal>
      )}
    </div>
  );
}
