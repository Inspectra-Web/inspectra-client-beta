import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import { displayName, formatDate, formatTime } from "@/lib/format";
import {
  useRealtorInspections,
  PAGE_SIZE,
  PAST_QUERY,
  UPCOMING_QUERY,
  type InspectionQuery,
} from "@/lib/inspections";
import { cn } from "@/lib/cn";

type Tab = "upcoming" | "past";

// The two tabs open on the resting queries the seam exports, so the sidebar pill and
// this page share one cache entry rather than firing a request each.
const TABS: { key: Tab; label: string; query: InspectionQuery }[] = [
  { key: "upcoming", label: "Upcoming", query: UPCOMING_QUERY },
  { key: "past", label: "Past", query: PAST_QUERY },
];

export function RealtorInspections() {
  const navigate = useNavigate();
  const [query, setQuery] = useState<InspectionQuery>(UPCOMING_QUERY);

  const { data, isPending, isError, error, isPlaceholderData } =
    useRealtorInspections(query);

  const rows = data?.inspections ?? [];
  const counts = data?.counts;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const upcoming = query.window === "upcoming";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Inspections"
          subtitle="Viewings buyers have booked on your listings."
        />
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
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={CalendarCheck}
            title={upcoming ? "No upcoming inspections" : "No past inspections"}
            message={
              upcoming
                ? "When a buyer books a viewing on one of your listings, it will show up here."
                : "Viewings that are done, declined or called off are archived here."
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[600px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>When</th>
                <th className={thCls}>Listing</th>
                <th className={cn(thCls, "max-md:hidden")}>Buyer</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "w-10")}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            }
          >
            {rows.map((row, i) => {
              const buyer = displayName(row.seeker.fullname);

              return (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/realtor/inspections/${row.id}`)}
                  className={rowCls}
                >
                  <td className={cn(tdCls, "tabular-nums text-muted")}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className={cn(tdCls, "whitespace-nowrap")}>
                    <p className="font-semibold text-ink">{formatDate(row.slot)}</p>
                    <p className="text-xs text-muted">{formatTime(row.slot)}</p>
                  </td>
                  <td className={cn(tdCls, "max-w-[16rem] text-ink")}>
                    <span className="line-clamp-1 font-medium">{row.property.title}</span>
                    <span className="line-clamp-1 text-xs text-muted md:hidden">
                      {buyer}
                    </span>
                  </td>
                  <td className={cn(tdCls, "text-muted max-md:hidden")}>
                    <span className="flex items-center gap-2">
                      <UserAvatar
                        name={buyer}
                        avatar={row.seeker.avatar}
                        className="size-7 text-[0.65rem]"
                      />
                      <span className="line-clamp-1">{buyer}</span>
                    </span>
                  </td>
                  <td className={tdCls}>
                    <StatusPill status={row.status} />
                  </td>
                  <td className={cn(tdCls, "text-right")}>
                    <ChevronRight className="ml-auto size-4 text-faint transition-colors group-hover:text-brand-ink" />
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Reveal>
      )}

      {!isError && !isPending && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of{" "}
            {total} {total === 1 ? "viewing" : "viewings"}
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

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="h-12 border-b border-line bg-surface-2/40" />
      <div className="divide-y divide-line">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 max-sm:px-4">
            <div className="h-4 w-6 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
            <div className="h-4 flex-1 animate-pulse rounded bg-surface-2" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
