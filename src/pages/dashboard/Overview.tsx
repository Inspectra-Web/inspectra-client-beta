import { Link } from "react-router";
import {
  Heart,
  MessageSquare,
  CalendarCheck,
  ArrowRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { useSavedIds } from "@/lib/saved";
import { displayName, formatTime, timeAgo } from "@/lib/format";
import {
  listingAddress,
  usePublicListings,
  toCardListing,
  EMPTY_QUERY as LISTINGS_QUERY,
} from "@/lib/marketplace";
import { useMyInquiries, EMPTY_QUERY, type InquiryRow } from "@/lib/inquiries";
import {
  useMyInspections,
  UPCOMING_QUERY,
  type InspectionRow,
} from "@/lib/inspections";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Overview() {
  const firstName = displayName(useAuthUser().fullname).split(" ")[0];

  // All three read the resting query their own page opens on, so the tiles here and
  // the pills in the sidebar share the cache entries rather than fetching again.
  const { ids } = useSavedIds();
  const threadsQuery = useMyInquiries(EMPTY_QUERY);
  const bookedQuery = useMyInspections(UPCOMING_QUERY);

  const threads = threadsQuery.data;
  const booked = bookedQuery.data;

  const awaitingReply = threads?.counts.new ?? 0;
  // Soonest first is the list's own order, so the next viewing is simply the first.
  const next = booked?.inspections[0];

  // Both counts are taken before their filters, so `all` is the whole history: a seeker
  // whose only viewing has already happened must not be told to start from scratch.
  // Gated on isSuccess so a failed request can never render as a first run.
  const quiet =
    threadsQuery.isSuccess &&
    bookedQuery.isSuccess &&
    threadsQuery.data.counts.all === 0 &&
    bookedQuery.data.counts.all === 0;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title={`${greeting()}, ${firstName}`}
          subtitle="Here's what's happening with your home search."
        />
      </Reveal>

      {/* stats */}
      <Reveal className="grid grid-cols-3 gap-4 max-md:grid-cols-1" y={16}>
        <StatCard icon={Heart} label="Saved homes" value={ids.length} to="/dashboard/saved" />
        <StatCard
          icon={MessageSquare}
          label="Inquiries"
          value={threads?.counts.all ?? 0}
          // Only once the count is real. "All caught up" on a request that failed or has
          // not landed asserts something no data supports, which a bare 0 does not.
          hint={
            threads
              ? awaitingReply > 0
                ? `${awaitingReply} awaiting a reply`
                : "All caught up"
              : undefined
          }
          to="/dashboard/inquiries"
        />
        <StatCard
          icon={CalendarCheck}
          label="Upcoming inspections"
          value={booked?.counts.upcoming ?? 0}
          to="/dashboard/inspections"
        />
      </Reveal>

      {quiet ? (
        <Reveal y={16}>
          <EmptyState
            icon={Search}
            title="Your search starts here"
            message="Message a realtor or book a viewing, and it will show up on this page."
          />
        </Reveal>
      ) : (
        /* next inspection + latest inquiries. min-w-0 on both tracks: a grid track's
           automatic minimum is its content's min-content width, so one long listing
           title would push a column past its share and squeeze the other. */
        <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-lg:grid-cols-1">
          <Reveal y={16} className="min-w-0">
            <Panel
              title="Next inspection"
              action={<PanelLink to="/dashboard/inspections">View all</PanelLink>}
              className="h-full"
            >
              {bookedQuery.isPending ? (
                <div className="h-36 animate-pulse rounded-xl bg-surface-2" />
              ) : bookedQuery.isError ? (
                <p className="py-6 text-muted">{apiMessage(bookedQuery.error)}</p>
              ) : next ? (
                <NextInspection inspection={next} />
              ) : (
                <div className="py-6">
                  <p className="text-muted">No inspections scheduled yet.</p>
                  <Link to="/listings" className={buttonClasses("outline", "sm", "mt-4")}>
                    Find a home to view
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              )}
            </Panel>
          </Reveal>

          <Reveal y={16} className="min-w-0">
            <Panel
              title="Latest inquiries"
              action={<PanelLink to="/dashboard/inquiries">View all</PanelLink>}
              className="h-full"
            >
              {threadsQuery.isPending ? (
                <RowsSkeleton />
              ) : threadsQuery.isError ? (
                <p className="py-6 text-muted">{apiMessage(threadsQuery.error)}</p>
              ) : (
                <InquiriesList rows={threadsQuery.data.inquiries.slice(0, 3)} />
              )}
            </Panel>
          </Reveal>
        </div>
      )}

      <VerifiedHomes />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PanelLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-brand-ink hover:underline">
      {children}
    </Link>
  );
}

/**
 * The one strip of real listings on the page.
 *
 * `status: "verified"` is set rather than left to `sort: "recommended"`, which is only
 * verified-first: with three slots a pending listing would otherwise appear under a
 * heading that says verified. The landing page's FeaturedListings can lean on the sort
 * because its copy makes no such claim.
 *
 * Deliberately not filtered by the seeker's `preferredCity`. The Account page offers a
 * closed list of state capitals while a realtor types the listing's city as free text
 * ("City / LGA", e.g. Lekki), so the two are different vocabularies: filtering would
 * return nothing for precisely the seekers who set a preference, and saying "nothing in
 * Lagos yet" would be false when the listings are simply filed under Lekki.
 */
function VerifiedHomes() {
  const { data, isPending, isError, error } = usePublicListings(
    { ...LISTINGS_QUERY, status: "verified" },
    3,
  );

  const listings = data?.listings ?? [];

  // Nothing verified yet is not an empty band: the section stands down, the way
  // FeaturedListings does on the landing page.
  if (!isPending && !isError && listings.length === 0) return null;

  return (
    <Reveal y={16}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Verified homes</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <ShieldCheck className="size-4 text-verified" />
            Documents checked before the listing went live, trust-ranked
          </p>
        </div>
        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-brand-ink hover:underline max-sm:hidden"
        >
          Browse all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {isError ? (
        <p className="mt-5 text-muted">{apiMessage(error)}</p>
      ) : isPending ? (
        <CardsSkeleton />
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={toCardListing(listing)} />
          ))}
        </div>
      )}
    </Reveal>
  );
}

/**
 * The newest few conversations, in the list's own order. The buyer is writing to a
 * realtor, so the realtor is the row's subject and the listing is the second line,
 * which is the other way round from the panels where a property is the subject.
 */
function InquiriesList({ rows }: { rows: InquiryRow[] }) {
  if (!rows.length)
    return (
      <p className="py-6 text-muted">
        Messages you send a realtor about a listing will appear here.
      </p>
    );

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const name = displayName(row.realtor.fullname);

        return (
          <li key={row.id}>
            <Link
              to={`/dashboard/inquiries/${row.id}`}
              className="flex gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
            >
              <UserAvatar name={name} avatar={row.realtor.avatar} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{name}</p>
                  <StatusPill status={row.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-faint">
                  {row.property.title} · {timeAgo(row.lastMessageAt)}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-muted">{row.lastMessage}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The soonest viewing. Rescheduling and cancelling live on the detail page, which is
 * where the booking's whole state is: this card opens it rather than carrying its own
 * copy of two buttons that used to only fire a toast.
 */
function NextInspection({ inspection }: { inspection: InspectionRow }) {
  const { property, realtor } = inspection;
  const name = displayName(realtor.fullname);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <DateBlock date={inspection.slot} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">{formatTime(inspection.slot)}</p>
            <StatusPill status={inspection.status} />
          </div>
        </div>
      </div>

      <Link
        to={`/listings/${property.slug}`}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3 transition-colors hover:border-brand/40"
      >
        {property.image ? (
          <img
            src={property.image}
            alt={property.title}
            className="size-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-surface-2 text-faint">
            <CalendarCheck className="size-5" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{property.title}</p>
          <p className="truncate text-sm text-muted">{listingAddress(property)}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2.5">
        <UserAvatar name={name} avatar={realtor.avatar} className="size-8 text-xs" />
        <p className="text-sm text-muted">
          with <span className="font-medium text-ink">{name}</span>
        </p>
      </div>

      <div className="pt-1">
        <Link
          to={`/dashboard/inspections/${inspection.id}`}
          className={buttonClasses("outline", "sm")}
        >
          Manage this viewing
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-line p-3">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-surface-2" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-40 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[10/9] animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
