import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Heart, BadgeCheck, BedDouble, Bath, Ruler, Video, Building2 } from "lucide-react";
import type { CardListing } from "@/types";
import { formatPriceFull } from "@/lib/format";
import { useMe } from "@/lib/auth";
import { useSavedIds, useToggleSaved } from "@/lib/saved";
import { priceSuffix } from "@/lib/listing";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { cn } from "@/lib/cn";

export function PropertyCard({ listing }: { listing: CardListing }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: user } = useMe();
  const { isSaved } = useSavedIds();
  const toggle = useToggleSaved();

  const saved = isSaved(listing.id);

  // A visitor's heart is not dead, it just goes where saving becomes possible. The
  // whole card is an overlay link, so the click has to be stopped from opening it.
  const save = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: pathname } });
      return;
    }

    toggle.mutate({ id: listing.id, saved });
  };

  return (
    <article className="group relative flex flex-col">
      <Link
        to={listing.href}
        aria-label={`View ${listing.title}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      {/* media */}
      <div className="relative aspect-[10/9] overflow-hidden rounded-2xl transform-gpu">
        {listing.image ? (
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            className="size-full object-cover object-center"
          />
        ) : (
          <div className="grid size-full place-items-center bg-surface-2 text-faint">
            <Building2 className="size-9" aria-hidden />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <ListingIntentBadge listingFor={listing.listingFor} onPhoto />
          {listing.status === "verified" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
              <BadgeCheck className="size-3.5 text-emerald-600" strokeWidth={2.5} aria-hidden />
              Verified
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={toggle.isPending}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save property"}
          className="absolute right-3 top-3 z-10 transition-transform hover:scale-110 disabled:opacity-60"
        >
          <Heart
            className={cn(
              "size-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
              saved ? "fill-rose-500 text-rose-500" : "fill-black/25 text-white",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {listing.hasVideo && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <Video className="size-3.5" aria-hidden />
            Video
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-col pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-ink">{listing.title}</h3>
          {listing.realtor && (
            <span
              className="relative shrink-0"
              title={`Listed by ${listing.realtor.name}${listing.realtor.certified ? " · Certified" : ""}`}
            >
              {listing.realtor.avatar ? (
                <img
                  src={listing.realtor.avatar}
                  alt={listing.realtor.name}
                  loading="lazy"
                  className="size-8 rounded-full object-cover ring-1 ring-line"
                />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted ring-1 ring-line">
                  {listing.realtor.name.charAt(0).toUpperCase()}
                </span>
              )}
              {listing.realtor.certified && (
                <BadgeCheck
                  className="absolute -bottom-0.5 -right-0.5 size-4 fill-verified text-white drop-shadow-sm"
                  aria-hidden
                />
              )}
            </span>
          )}
        </div>

        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{listing.location}</p>

        {/* feature icons — zero is "not applicable", so it stays off the card */}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted">
          {listing.beds > 0 && <Feature Icon={BedDouble} label={`${listing.beds}`} />}
          {listing.baths > 0 && <Feature Icon={Bath} label={`${listing.baths}`} />}
          {listing.areaSqm > 0 && <Feature Icon={Ruler} label={`${listing.areaSqm} m²`} />}
        </div>

        <p className="mt-2 font-semibold text-ink">
          {formatPriceFull(listing.price)}
          {priceSuffix(listing.listingFor) && (
            <span className="font-normal text-muted"> {priceSuffix(listing.listingFor)}</span>
          )}
        </p>
      </div>
    </article>
  );
}

function Feature({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4 text-faint" />
      {label}
    </span>
  );
}
