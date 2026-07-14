import type { ListingFor } from "@/types";
import { LISTING_INTENT_LABEL } from "@/lib/listing";
import { cn } from "@/lib/cn";

/**
 * The listing's intent (For Sale / For Rent / For Lease / Shortlet), rendered as a
 * confident pill with a colour unique to each offer type. `onPhoto` uses a solid fill
 * for legibility over imagery; off-photo it uses a tinted chip.
 * Colours are chosen to stay distinct from the verification statuses (green / gold / rose).
 */
const STYLES: Record<ListingFor, { chip: string; onPhoto: string }> = {
  sale: {
    chip: "bg-blue-500/12 text-blue-700 ring-1 ring-blue-500/25 dark:text-blue-300",
    onPhoto: "bg-blue-600 text-white",
  },
  rent: {
    chip: "bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/25 dark:text-violet-300",
    onPhoto: "bg-violet-600 text-white",
  },
  lease: {
    chip: "bg-teal-500/12 text-teal-700 ring-1 ring-teal-500/25 dark:text-teal-300",
    onPhoto: "bg-teal-600 text-white",
  },
  shortlet: {
    chip: "bg-orange-500/14 text-orange-700 ring-1 ring-orange-500/25 dark:text-orange-300",
    onPhoto: "bg-orange-500 text-white",
  },
};

export function ListingIntentBadge({
  listingFor,
  className,
  onPhoto = false,
}: {
  listingFor: ListingFor;
  className?: string;
  onPhoto?: boolean;
}) {
  const style = STYLES[listingFor];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        onPhoto ? cn(style.onPhoto, "shadow-sm") : style.chip,
        className,
      )}
    >
      {LISTING_INTENT_LABEL[listingFor]}
    </span>
  );
}
