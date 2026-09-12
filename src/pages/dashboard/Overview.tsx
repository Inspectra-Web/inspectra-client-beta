import { Link } from "react-router";
import {
  Heart,
  MessageSquare,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";
import { savedPropertyIds, activity } from "@/data/seeker";
import { mockCardListing, properties } from "@/data/mock";
import { useAuthUser } from "@/lib/auth";
import { displayName, formatTime } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import { useMyInquiries, EMPTY_QUERY } from "@/lib/inquiries";
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

const recommended = properties.filter((p) => p.status === "verified").slice(0, 3);

export function Overview() {
  const firstName = displayName(useAuthUser().fullname).split(" ")[0];

  // Both read the resting query their own page opens on, so the tiles here and the
  // pills in the sidebar share the cache entries rather than fetching again.
  const { data: threads } = useMyInquiries(EMPTY_QUERY);
  const { data: booked, isPending } = useMyInspections(UPCOMING_QUERY);

  const awaitingReply = threads?.counts.new ?? 0;
  // Soonest first is the list's own order, so the next viewing is simply the first.
  const next = booked?.inspections[0];

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
        <StatCard
          icon={Heart}
          label="Saved homes"
          value={savedPropertyIds.length}
          to="/dashboard/saved"
        />
        <StatCard
          icon={MessageSquare}
          label="Inquiries"
          value={threads?.counts.all ?? 0}
          hint={awaitingReply > 0 ? `${awaitingReply} awaiting a reply` : "All caught up"}
          to="/dashboard/inquiries"
        />
        <StatCard
          icon={CalendarCheck}
          label="Upcoming inspections"
          value={booked?.counts.upcoming ?? 0}
          to="/dashboard/inspections"
        />
      </Reveal>

      {/* next inspection + activity */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-lg:grid-cols-1">
        <Reveal y={16}>
          <Panel
            title="Next inspection"
            action={
              <Link
                to="/dashboard/inspections"
                className="text-sm font-medium text-brand-ink hover:underline"
              >
                View all
              </Link>
            }
            className="h-full"
          >
            {isPending ? (
              <div className="h-36 animate-pulse rounded-xl bg-surface-2" />
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

        <Reveal y={16}>
          <Panel title="Recent activity" className="h-full">
            <ul>
              {activity.map((a, i) => (
                <ActivityItem
                  key={a.id}
                  activity={a}
                  isLast={i === activity.length - 1}
                />
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>

      {/* recommendations */}
      <Reveal y={16}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Recommended for you</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <ShieldCheck className="size-4 text-verified" />
              Verified homes, trust-ranked for your search
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
        <div className="mt-5 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {recommended.map((p) => (
            <PropertyCard key={p.id} listing={mockCardListing(p)} />
          ))}
        </div>
      </Reveal>
    </div>
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
          <p className="truncate font-medium text-ink">{property.title}</p>
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
