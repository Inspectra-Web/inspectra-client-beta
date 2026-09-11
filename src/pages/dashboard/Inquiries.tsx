import { useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  SearchX,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import { displayName, timeAgo } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import {
  useMyInquiries,
  EMPTY_QUERY,
  type InquiryQuery,
  type InquiryRow,
  type InquiryStatus,
} from "@/lib/inquiries";
import { cn } from "@/lib/cn";

type Filter = "all" | InquiryStatus;

// The same words the pill uses, so a row and the filter above it cannot disagree.
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
  { key: "closed", label: "Closed" },
];

export function Inquiries() {
  const [query, setQuery] = useState<InquiryQuery>(EMPTY_QUERY);

  const { data, isPending, isError, error, isPlaceholderData } = useMyInquiries(query);

  const inquiries = data?.inquiries ?? [];
  const counts = data?.counts ?? { all: 0, new: 0, responded: 0, closed: 0 };
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.status !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Inquiries"
          subtitle="Messages you've sent to realtors, and their replies."
        />
      </Reveal>

      <Reveal y={16}>
        <div
          role="group"
          aria-label="Filter inquiries"
          className="no-scrollbar inline-flex items-center gap-1 rounded-full border border-line bg-surface-2/60 p-1 max-sm:w-full max-sm:overflow-x-auto"
        >
          {FILTERS.map((f) => {
            const active = query.status === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setQuery((prev) => ({ ...prev, status: f.key, page: 1 }))}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                    : "text-muted hover:text-ink",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-brand/15 text-brand-ink" : "bg-surface-2 text-faint",
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={MessageSquare}
            title="Could not load your inquiries"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <ListSkeleton />
      ) : inquiries.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={filtered ? SearchX : MessageSquare}
            title={filtered ? "Nothing in this filter" : "No inquiries yet"}
            message={
              filtered
                ? "Clear the filter to see every conversation you have started."
                : "Reach out from any listing to ask about documents, pricing or a viewing."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => setQuery((prev) => ({ ...prev, status: "all", page: 1 }))}
                >
                  Clear filter
                </Button>
              ) : (
                <Link to="/listings" className={buttonClasses("brand", "md")}>
                  <Search className="size-4" aria-hidden />
                  Browse listings
                </Link>
              )
            }
          />
        </Reveal>
      ) : (
        <div className={cn("space-y-4 transition-opacity", isPlaceholderData && "opacity-60")}>
          {inquiries.map((row, i) => (
            <Reveal key={row.id} y={14} delay={i * 0.04}>
              <Row row={row} />
            </Reveal>
          ))}
        </div>
      )}

      {!isError && !isPending && inquiries.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{inquiries.length}</span> of{" "}
            {total} {total === 1 ? "conversation" : "conversations"}
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

function Row({ row }: { row: InquiryRow }) {
  const { property, realtor } = row;
  const name = displayName(realtor.fullname);

  return (
    <article className="group relative rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]">
      <Link
        to={`/dashboard/inquiries/${row.id}`}
        aria-label={`Open inquiry about ${property.title}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      <div className="flex items-start gap-4">
        <Thumbnail src={property.image} alt={property.title} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-semibold text-ink">{property.title}</h3>
              <p className="line-clamp-1 text-sm text-muted">{listingAddress(property)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <StatusPill status={row.status} />
              <span className="whitespace-nowrap text-xs text-faint">
                {timeAgo(row.lastMessageAt)}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <UserAvatar name={name} avatar={realtor.avatar} className="size-6 text-[0.6rem]" />
            <span className="font-medium text-ink">{name}</span>
          </div>

          <p className="mt-3 line-clamp-1 text-sm text-muted">{row.lastMessage}</p>
        </div>

        <ChevronRight className="mt-1 size-5 shrink-0 self-center text-faint transition-colors group-hover:text-brand-ink" />
      </div>
    </article>
  );
}

/** A listing with no photo still needs a tile, or the row collapses. */
function Thumbnail({ src, alt }: { src: string; alt: string }) {
  if (!src)
    return (
      <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint max-sm:size-14">
        <MessageSquare className="size-6" aria-hidden />
      </span>
    );

  return (
    <img
      src={src}
      alt={alt}
      className="size-16 shrink-0 rounded-xl object-cover max-sm:size-14"
    />
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
          <div className="size-16 shrink-0 animate-pulse rounded-xl bg-surface-2 max-sm:size-14" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-4 w-56 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-full max-w-sm animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
