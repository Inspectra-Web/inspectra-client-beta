import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DocCheckList } from "@/components/realtor/DocCheckList";
import { VerificationBar } from "@/components/dashboard/VerificationBar";
import { apiMessage } from "@/lib/api";
import { toDocCheck } from "@/lib/listing";
import {
  listingLocation,
  useMyListings,
  verifiedRate,
  type ListingQuery,
  type RealtorListing,
} from "@/lib/properties";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

type Filter = "all" | VerificationStatus;

const SEGMENTS: { key: Filter; label: string; activeCls: string }[] = [
  { key: "all", label: "All", activeCls: "bg-ink text-bg" },
  { key: "verified", label: "Verified", activeCls: "bg-verified text-white" },
  { key: "pending", label: "Pending", activeCls: "bg-gold text-white" },
  { key: "disputed", label: "Disputed", activeCls: "bg-rose-500 text-white" },
];

/** Verified first, which is what "recommended" sorts to: descending on the status
 *  string reads verified, pending, disputed. The segmented control is how a realtor
 *  pulls up the ones still waiting on them. */
const START: ListingQuery = { q: "", status: "all", sort: "recommended", page: 1 };

export function RealtorVerification() {
  const [query, setQuery] = useState<ListingQuery>(START);

  const { data, isPending, isError, error, isPlaceholderData } = useMyListings(query);

  const rows = data?.properties ?? [];
  const counts = data?.counts;
  const { page = 1, pages = 1 } = data ?? {};

  const total = counts?.all ?? 0;
  const rate = counts ? verifiedRate(counts) : 0;

  const segCount = (k: Filter) => counts?.[k] ?? 0;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Verification"
          subtitle="Every document behind your listings. Verified paperwork keeps a listing live and ranked in search."
        />
      </Reveal>

      <Reveal y={16}>
        <Panel>
          <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-verified/10 text-verified">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="display text-3xl leading-none text-ink">
                <span className="tabular-nums">{rate}</span>
                <span className="text-xl text-muted">%</span>
                <span className="ml-3 align-middle text-sm font-normal text-muted">
                  of {total} {total === 1 ? "listing" : "listings"} verified
                </span>
              </p>
              {counts && <VerificationBar counts={counts} className="mt-4 w-full max-w-md" />}
            </div>
          </div>
        </Panel>
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
            title="Could not load your listings"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <CardsSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={ShieldCheck}
            title={total === 0 ? "No listings yet" : "Nothing at that status"}
            message={
              total === 0
                ? "Publish a listing and attach its title documents. Verification starts from there."
                : "None of your listings sit at that status right now."
            }
            action={
              total === 0 ? (
                <Link to="/realtor/listings/new" className={buttonClasses("brand", "md")}>
                  Add a listing
                </Link>
              ) : undefined
            }
          />
        </Reveal>
      ) : (
        <div className={cn("space-y-4", isPlaceholderData && "opacity-60")}>
          {rows.map((listing, i) => (
            <Reveal key={listing.id} y={16} delay={Math.min(i, 6) * 0.04}>
              <VerificationCard listing={listing} />
            </Reveal>
          ))}
        </div>
      )}

      {!isError && !isPending && pages > 1 && (
        <div className="flex items-center justify-end gap-3">
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
  );
}

function VerificationCard({ listing }: { listing: RealtorListing }) {
  const checks = listing.documents.map(toDocCheck(listing.id));
  const verified = checks.filter((c) => c.state === "verified").length;
  const cover = listing.images[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-4 border-b border-line p-5 max-sm:flex-wrap">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            className="size-16 shrink-0 rounded-xl object-cover max-sm:size-14"
          />
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint max-sm:size-14">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <Link
              to={`/realtor/listings/${listing.id}`}
              className="truncate font-semibold text-ink transition-colors hover:text-brand-ink"
            >
              {listing.title}
            </Link>
            <StatusBadge status={listing.verification.status} className="shrink-0" />
          </div>
          <p className="mt-1 truncate text-sm text-muted">{listingLocation(listing)}</p>
        </div>
        <p className="shrink-0 text-sm text-muted max-sm:order-3 max-sm:w-full">
          <span className="font-semibold tabular-nums text-ink">{verified}</span> of{" "}
          <span className="tabular-nums">{checks.length}</span> verified
        </p>
      </div>

      {listing.verification.note && (
        <div className="flex items-start gap-3 border-b border-line bg-rose-500/5 px-5 py-4">
          <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-rose-500" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink">Reviewer's note</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">
              {listing.verification.note}
            </p>
          </div>
        </div>
      )}

      <div className="px-5 py-3">
        {checks.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 py-2">
            <p className="text-sm text-muted">
              No documents attached yet. A listing cannot be verified without them.
            </p>
            <Link
              to={`/realtor/listings/${listing.id}/edit`}
              className={buttonClasses("outline", "sm")}
            >
              Add documents
            </Link>
          </div>
        ) : (
          <DocCheckList checks={checks} actions />
        )}
      </div>
    </article>
  );
}

function CardsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-4 border-b border-line p-5">
            <div className="size-16 shrink-0 animate-pulse rounded-xl bg-surface-2" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-56 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
          <div className="space-y-3 px-5 py-5">
            <div className="h-9 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-9 w-full animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
