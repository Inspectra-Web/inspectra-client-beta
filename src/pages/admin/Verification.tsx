import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button, buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { QUEUE_QUERY, useAdminListings, type AdminListingQuery } from "@/lib/adminListings";
import { displayName, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

/** A queue shows undecided work, so "All" is the open set and there is no verified segment. */
type Filter = "open" | "pending" | "disputed";

const SEGMENTS: { key: Filter; label: string; activeCls: string }[] = [
  { key: "open", label: "All", activeCls: "bg-ink text-bg" },
  { key: "pending", label: "Pending", activeCls: "bg-gold text-white" },
  { key: "disputed", label: "Disputed", activeCls: "bg-rose-500 text-white" },
];

export function AdminVerification() {
  const [query, setQuery] = useState<AdminListingQuery>(QUEUE_QUERY);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminListings(query);

  const rows = data?.listings ?? [];
  const counts = data?.counts;
  const { page = 1, pages = 1, total = 0 } = data ?? {};

  // The counts strip covers the whole platform, so the open segment adds the two itself.
  const segCount = (k: Filter) =>
    !counts ? 0 : k === "open" ? counts.pending + counts.disputed : counts[k];

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Verification queue"
          subtitle="Every listing waiting on a decision. Clear the paperwork to mint the Verified badge, or flag it back to the realtor."
        />
      </Reveal>

      <Reveal y={16}>
        <div
          role="group"
          aria-label="Filter by verification status"
          className="no-scrollbar inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 max-sm:w-full max-sm:overflow-x-auto"
        >
          {SEGMENTS.map((s) => {
            const active = query.status === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setQuery((prev) => ({ ...prev, status: s.key, page: 1 }))}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                  active ? s.activeCls : "text-muted hover:text-ink",
                )}
              >
                {s.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-white/20" : "bg-surface-2 text-faint",
                  )}
                >
                  {segCount(s.key)}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={ShieldCheck}
            title="Could not load the queue"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <QueueSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={ShieldCheck}
            title="Queue is clear"
            message="Nothing is waiting on a decision right now. Every listing has been reviewed."
          />
        </Reveal>
      ) : (
        <div className={cn("space-y-4", isPlaceholderData && "opacity-60")}>
          {rows.map((l, i) => (
            <Reveal key={l.id} y={16} delay={Math.min(i, 6) * 0.04}>
              <Link
                to={`/admin/verification/${l.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)] max-sm:flex-wrap"
              >
                <Thumbnail src={l.image} alt={l.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="truncate font-semibold text-ink">{l.title}</h3>
                    <StatusBadge status={l.status} className="shrink-0" />
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">
                    {displayName(l.realtorName) || "Unknown realtor"} · {l.fullAddress || l.city}
                  </p>
                  <p className="mt-1 truncate text-xs text-faint">{l.ref}</p>
                </div>
                <div className="flex shrink-0 items-center gap-5 max-sm:w-full max-sm:justify-between">
                  <div className="text-right max-sm:text-left">
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      {l.docsVerified} of {l.docs}
                    </p>
                    <p className="text-xs text-faint">docs cleared</p>
                  </div>
                  <span className="text-xs text-faint max-md:hidden">{formatDate(l.createdAt)}</span>
                  <span
                    className={buttonClasses("outline", "sm", "shrink-0 group-hover:border-brand/40")}
                  >
                    Review
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {!isError && !isPending && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {total}{" "}
            {total === 1 ? "listing" : "listings"} waiting
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

/** A listing with no photo yet still needs a tile, or the row collapses. */
function Thumbnail({ src, alt }: { src: string; alt: string }) {
  if (!src)
    return (
      <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint ring-1 ring-line max-sm:size-14">
        <ShieldCheck className="size-6" aria-hidden />
      </span>
    );

  return (
    <img src={src} alt={alt} className="size-16 shrink-0 rounded-xl object-cover max-sm:size-14" />
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
        >
          <div className="size-16 shrink-0 animate-pulse rounded-xl bg-surface-2 max-sm:size-14" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-56 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-44 animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-surface-2 max-sm:hidden" />
        </div>
      ))}
    </div>
  );
}
