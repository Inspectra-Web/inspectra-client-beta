import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { ChevronRight, Plus, Search, SearchX } from "lucide-react";
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
import { myListings } from "@/data/realtor";
import { propertyById } from "@/data/mock";
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

const SORT_OPTIONS = [
  { value: "recent", label: "Recently added" },
  { value: "views", label: "Most viewed" },
  { value: "leads", label: "Most leads" },
];

const listings = myListings
  .map((l) => ({ ...l, property: propertyById(l.id) }))
  .filter((l): l is typeof l & { property: NonNullable<typeof l.property> } => !!l.property);

export function RealtorListings() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState("recent");

  const base = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return listings;
    return listings.filter((l) =>
      `${l.property.title} ${l.property.location} ${l.property.city} ${l.property.ref}`
        .toLowerCase()
        .includes(query),
    );
  }, [q]);

  const counts = useMemo(
    () => ({
      all: base.length,
      verified: base.filter((l) => l.property.status === "verified").length,
      pending: base.filter((l) => l.property.status === "pending").length,
      disputed: base.filter((l) => l.property.status === "disputed").length,
    }),
    [base],
  );

  const results = useMemo(() => {
    const list = status === "all" ? base : base.filter((l) => l.property.status === status);
    if (sort === "views") return [...list].sort((a, b) => b.views - a.views);
    if (sort === "leads") return [...list].sort((a, b) => b.leads - a.leads);
    return list;
  }, [base, status, sort]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Listings"
          subtitle="Manage your portfolio and track how each listing is performing."
          actions={
            <Button variant="brand" onClick={() => navigate("/realtor/listings/new")}>
              <Plus className="size-4" aria-hidden />
              New listing
            </Button>
          }
        />
      </Reveal>

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
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
              const active = status === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
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
            <Select value={sort} onValueChange={setSort}>
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

      {/* table */}
      {results.length > 0 ? (
        <Reveal y={16}>
          <DataTable
            minWidthClass="min-w-[720px]"
            head={
              <tr>
                <th className={thCls}>Listing</th>
                <th className={thCls}>Offer</th>
                <th className={cn(thCls, "max-lg:hidden")}>Type</th>
                <th className={cn(thCls, "text-right max-md:hidden")}>Price</th>
                <th className={cn(thCls, "text-right max-sm:hidden")}>Views</th>
                <th className={cn(thCls, "text-right max-sm:hidden")}>Leads</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "w-10")}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            }
          >
            {results.map((l) => (
              <tr
                key={l.id}
                onClick={() => navigate(`/realtor/listings/${l.id}`)}
                className={rowCls}
              >
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <img
                      src={l.property.image}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-line"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/realtor/listings/${l.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="line-clamp-1 font-medium text-ink hover:text-brand-ink"
                      >
                        {l.property.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-muted">
                        {l.property.location}, {l.property.city}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={tdCls}>
                  <ListingIntentBadge listingFor={l.property.listingFor} />
                </td>
                <td className={cn(tdCls, "whitespace-nowrap text-muted max-lg:hidden")}>
                  {l.property.type}
                </td>
                <td
                  className={cn(
                    tdCls,
                    "whitespace-nowrap text-right font-medium text-ink max-md:hidden",
                  )}
                >
                  {formatPrice(l.property.price)}
                  {priceSuffix(l.property.listingFor) && (
                    <span className="font-normal text-faint">
                      {" "}
                      {priceSuffix(l.property.listingFor)}
                    </span>
                  )}
                </td>
                <td className={cn(tdCls, "text-right tabular-nums text-muted max-sm:hidden")}>
                  {l.views.toLocaleString()}
                </td>
                <td className={cn(tdCls, "text-right tabular-nums text-muted max-sm:hidden")}>
                  {l.leads}
                </td>
                <td className={tdCls}>
                  <StatusBadge status={l.property.status} />
                </td>
                <td className={cn(tdCls, "text-right")}>
                  <ChevronRight className="ml-auto size-4 text-faint transition-colors group-hover:text-brand-ink" />
                </td>
              </tr>
            ))}
          </DataTable>
        </Reveal>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No listings match"
          message="Try a different search or clear the verification filter to see your whole portfolio."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}
