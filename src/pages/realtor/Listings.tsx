import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Building2, ChevronLeft, ChevronRight, Plus, Search, SearchX } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ListingGate } from "@/components/realtor/ListingGate";
import { apiMessage } from "@/lib/api";
import {
  useMyListings,
  listingLocation,
  typeLabel,
  PAGE_SIZE,
  type ListingQuery,
  type ListingSort,
} from "@/lib/properties";
import { useListingEligibility } from "@/lib/profile";
import { formatPrice } from "@/lib/format";
import { priceSuffix } from "@/lib/listing";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

type StatusFilter = "all" | VerificationStatus;

const SEGMENTS: { key: StatusFilter; label: string; activeCls: string }[] = [
  { key: "all", label: "All", activeCls: "bg-ink text-bg" },
  { key: "verified", label: "Verified", activeCls: "bg-verified text-white" },
  { key: "pending", label: "Pending", activeCls: "bg-gold text-white" },
  { key: "disputed", label: "Disputed", activeCls: "bg-rose-500 text-white" },
];

// "Recommended" is the marketplace's verified-first ordering; a realtor sorting
// their own portfolio wants recency.
const SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: "newest", label: "Recently added" },
  { value: "views", label: "Most viewed" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
];

export function RealtorListings() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<ListingQuery>({
    q: "",
    status: "all",
    sort: "newest",
    page: 1,
  });

  // The server does the searching, so hold off a beat rather than firing a
  // request per keystroke. Any new search starts again at page 1.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setQuery((prev) =>
          prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 },
        ),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useMyListings(query);

  const listings = data?.properties ?? [];
  const counts = data?.counts ?? { all: 0, verified: 0, pending: 0, disputed: 0 };
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.q !== "" || query.status !== "all";

  const { data: eligibility } = useListingEligibility();
  // Undefined while the query is in flight: the button is not disabled on a guess.
  const barred = eligibility ? !eligibility.ready : false;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Listings"
          subtitle="Manage your portfolio and track how each listing is performing."
          actions={
            <Button
              variant="brand"
              disabled={barred}
              title={barred ? "Finish your setup before you list" : undefined}
              onClick={() => navigate("/realtor/listings/new")}
            >
              <Plus className="size-4" aria-hidden />
              New listing
            </Button>
          }
        />
      </Reveal>

      {/* Above the table, not in place of it: a realtor who already has listings still
          needs to see them while they finish setting up. */}
      {barred && (
        <Reveal y={12}>
          <ListingGate missing={eligibility!.missing} />
        </Reveal>
      )}

      {/* toolbar */}
      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
              aria-hidden
            />
            <Input
              type="search"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search by title, area or listing ref…"
              aria-label="Search your listings"
              className="h-10 pl-11"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by verification status"
            className="no-scrollbar inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface p-1 max-sm:w-full max-sm:overflow-x-auto"
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
                    {counts[s.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
            <span className="text-sm text-muted max-sm:hidden">Sort</span>
            <Select
              value={query.sort}
              onValueChange={(sort) =>
                setQuery((prev) => ({ ...prev, sort: sort as ListingSort, page: 1 }))
              }
            >
              <SelectTrigger aria-label="Sort listings" className="w-44 max-sm:flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={Building2}
            title="Could not load your listings"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : listings.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={filtered ? SearchX : Building2}
            title={filtered ? "No listings match" : "No listings yet"}
            message={
              filtered
                ? "Try a different search or clear the verification filter to see your whole portfolio."
                : "Add your first property and we will check its documents before it goes live."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTyped("");
                    setQuery((prev) => ({ ...prev, q: "", status: "all", page: 1 }));
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="brand"
                  disabled={barred}
                  onClick={() => navigate("/realtor/listings/new")}
                >
                  <Plus className="size-4" aria-hidden />
                  New listing
                </Button>
              )
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[720px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>Listing</th>
                <th className={thCls}>Offer</th>
                <th className={cn(thCls, "max-lg:hidden")}>Type</th>
                <th className={cn(thCls, "text-right max-md:hidden")}>Price</th>
                <th className={cn(thCls, "text-right max-sm:hidden")}>Views</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "w-10")}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            }
          >
            {listings.map((l, i) => (
              <tr
                key={l.id}
                onClick={() => navigate(`/realtor/listings/${l.id}`)}
                className={rowCls}
              >
                <td className={cn(tdCls, "tabular-nums text-muted")}>
                  {(page - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <Thumbnail src={l.images[0]} />
                    <div className="min-w-0">
                      <Link
                        to={`/realtor/listings/${l.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="line-clamp-1 font-medium text-ink hover:text-brand-ink"
                      >
                        {l.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-muted">
                        {listingLocation(l)} · {l.ref}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={tdCls}>
                  <ListingIntentBadge listingFor={l.listingStatus} />
                </td>
                <td className={cn(tdCls, "whitespace-nowrap text-muted max-lg:hidden")}>
                  {typeLabel(l.type)}
                </td>
                <td
                  className={cn(
                    tdCls,
                    "whitespace-nowrap text-right font-medium text-ink max-md:hidden",
                  )}
                >
                  {formatPrice(l.price)}
                  {priceSuffix(l.listingStatus) && (
                    <span className="font-normal text-faint">
                      {" "}
                      {priceSuffix(l.listingStatus)}
                    </span>
                  )}
                </td>
                <td className={cn(tdCls, "text-right tabular-nums text-muted max-sm:hidden")}>
                  {l.views.toLocaleString()}
                </td>
                <td className={tdCls}>
                  <StatusBadge status={l.verification.status} />
                </td>
                <td className={cn(tdCls, "text-right")}>
                  <ChevronRight className="ml-auto size-4 text-faint transition-colors group-hover:text-brand-ink" />
                </td>
              </tr>
            ))}
          </DataTable>
        </Reveal>
      )}

      {!isError && !isPending && listings.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{listings.length}</span> of{" "}
            {total} {total === 1 ? "listing" : "listings"}
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
function Thumbnail({ src }: { src?: string }) {
  if (!src)
    return (
      <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-surface-2 text-faint ring-1 ring-line">
        <Building2 className="size-5" aria-hidden />
      </span>
    );

  return (
    <img src={src} alt="" className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-line" />
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="h-12 border-b border-line bg-surface-2/40" />
      <div className="divide-y divide-line">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 max-sm:px-4">
            <div className="size-12 shrink-0 animate-pulse rounded-lg bg-surface-2" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-52 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-2 max-sm:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
}
