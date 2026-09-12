import { useState } from "react";
import { Link } from "react-router";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchX,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { displayName, formatTime } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import {
  useMyInspections,
  PAST_QUERY,
  UPCOMING_QUERY,
  type InspectionQuery,
  type InspectionRow,
} from "@/lib/inspections";
import { cn } from "@/lib/cn";

type Tab = "upcoming" | "past";

// The two tabs open on the resting queries the seam exports, so switching back to
// Upcoming lands on the same cache entry the sidebar pill is already holding.
const TABS: { key: Tab; label: string; query: InspectionQuery }[] = [
  { key: "upcoming", label: "Upcoming", query: UPCOMING_QUERY },
  { key: "past", label: "Past", query: PAST_QUERY },
];

export function Inspections() {
  const [query, setQuery] = useState<InspectionQuery>(UPCOMING_QUERY);

  const { data, isPending, isError, error, isPlaceholderData } = useMyInspections(query);

  const inspections = data?.inspections ?? [];
  const counts = data?.counts;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const upcoming = query.window === "upcoming";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title="Inspections" subtitle="Your booked property viewings." />
      </Reveal>

      <Reveal y={16}>
        <div
          role="group"
          aria-label="Filter inspections"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2/60 p-1"
        >
          {TABS.map((tab) => {
            const active = query.window === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setQuery(tab.query)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                    : "text-muted hover:text-ink",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-brand/15 text-brand-ink" : "bg-surface-2 text-faint",
                  )}
                >
                  {counts?.[tab.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={CalendarCheck}
            title="Could not load your inspections"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <ListSkeleton />
      ) : inspections.length === 0 ? (
        <Reveal y={16}>
          {/* Off the total rather than the tab, so an account with nothing booked does
              not read as an empty filter. */}
          <EmptyState
            icon={counts?.all ? SearchX : CalendarCheck}
            title={upcoming ? "No upcoming inspections" : "No past inspections"}
            message={
              upcoming
                ? "Book a viewing from any listing and it will show up here."
                : "Once a viewing is done, declined or called off, it is archived here."
            }
            action={
              upcoming ? (
                <Link to="/listings" className={buttonClasses("brand", "md")}>
                  <Search className="size-4" aria-hidden />
                  Browse listings
                </Link>
              ) : undefined
            }
          />
        </Reveal>
      ) : (
        <div
          className={cn("space-y-4 transition-opacity", isPlaceholderData && "opacity-60")}
        >
          {inspections.map((row, i) => (
            <Reveal key={row.id} y={14} delay={i * 0.04}>
              <Row row={row} />
            </Reveal>
          ))}
        </div>
      )}

      {!isError && !isPending && inspections.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">
              {inspections.length}
            </span>{" "}
            of {total} {total === 1 ? "viewing" : "viewings"}
          </p>

          {pages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-muted">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ row }: { row: InspectionRow }) {
  const { property, realtor } = row;

  return (
    <article className="group relative flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)] max-sm:gap-4">
      <Link
        to={`/dashboard/inspections/${row.id}`}
        aria-label={`Open inspection for ${property.title}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      <DateBlock date={row.slot} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <p className="font-semibold text-ink">{formatTime(row.slot)}</p>
          <StatusPill status={row.status} />
        </div>

        <p className="mt-1.5 line-clamp-1 font-medium text-ink">{property.title}</p>
        <p className="line-clamp-1 text-sm text-muted">
          {listingAddress(property)} · with {displayName(realtor.fullname)}
        </p>
      </div>

      <ChevronRight className="size-5 shrink-0 text-faint transition-colors group-hover:text-brand-ink" />
    </article>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 max-sm:gap-4"
        >
          <div className="size-16 shrink-0 animate-pulse rounded-2xl bg-surface-2" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-4 w-48 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-56 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
