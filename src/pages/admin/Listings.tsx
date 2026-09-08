import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { apiMessage } from "@/lib/api";
import {
  useAdminListings,
  PAGE_SIZE,
  type AdminListingQuery,
} from "@/lib/adminListings";
import { displayName, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AdminListings() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<AdminListingQuery>({
    q: "",
    status: "all",
    city: "all",
    page: 1,
  });
  const [openId, setOpenId] = useState<string | null>(null);

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
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

  const { data, isPending, isError, error, isPlaceholderData } = useAdminListings(query);

  const rows = data?.listings ?? [];
  const cities = data?.cities ?? [];
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.q !== "" || query.status !== "all" || query.city !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Listings"
          subtitle="Every property on the platform. Open one to moderate its status or media."
        />
      </Reveal>

      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              type="search"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search by title, area, ref or realtor…"
              aria-label="Search listings"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            {...selectProps("status")}
            label="Status"
            value={query.status}
            onChange={(status) =>
              setQuery((prev) => ({
                ...prev,
                status: status as AdminListingQuery["status"],
                page: 1,
              }))
            }
            options={[
              { value: "all", label: "All statuses" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "disputed", label: "Disputed" },
            ]}
          />
          <AdminSelect
            {...selectProps("city")}
            label="City"
            value={query.city}
            onChange={(city) => setQuery((prev) => ({ ...prev, city, page: 1 }))}
            options={[
              { value: "all", label: "All cities" },
              ...cities.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={Building2}
            title="Could not load listings"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={Building2}
            title={filtered ? "No listings match" : "No listings yet"}
            message={
              filtered
                ? "Nothing matches those filters. Try a different search, or widen the status and city."
                : "Properties will appear here as realtors publish them."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTyped("");
                    setQuery({ q: "", status: "all", city: "all", page: 1 });
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[840px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>Property</th>
                <th className={thCls}>Offer</th>
                <th className={thCls}>Ref</th>
                <th className={cn(thCls, "max-md:hidden")}>Realtor</th>
                <th className={thCls}>Price</th>
                <th className={thCls}>Status</th>
              </tr>
            }
          >
            {rows.map((l, i) => (
              <tr key={l.id} className={rowCls} onClick={() => navigate(`/admin/listings/${l.id}`)}>
                <td className={cn(tdCls, "tabular-nums text-muted")}>
                  {(page - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <Thumbnail src={l.image} />
                    {/* Capped: the column is auto-sized, so a long title would take the
                        width the other six need. The full text is on hover. */}
                    <div className="min-w-0 max-w-64" title={l.title}>
                      <p className="truncate font-medium text-ink">{l.title}</p>
                      <p className="truncate text-xs text-muted">
                        {[l.fullAddress, l.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={tdCls}>
                  <ListingIntentBadge listingFor={l.listingStatus} />
                </td>
                <td className={cn(tdCls, "whitespace-nowrap text-sm tabular-nums text-muted")}>
                  {l.ref}
                </td>
                <td className={cn(tdCls, "whitespace-nowrap text-sm text-muted max-md:hidden")}>
                  {l.realtorName ? displayName(l.realtorName) : "-"}
                </td>
                <td className={cn(tdCls, "whitespace-nowrap font-medium tabular-nums text-ink")}>
                  {formatPrice(l.price)}
                </td>
                <td className={tdCls}>
                  <StatusBadge status={l.status} />
                </td>
              </tr>
            ))}
          </DataTable>
        </Reveal>
      )}

      {!isError && !isPending && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {total}{" "}
            {total === 1 ? "listing" : "listings"}
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
function Thumbnail({ src }: { src: string }) {
  if (!src)
    return (
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2 text-faint ring-1 ring-line">
        <Building2 className="size-5" aria-hidden />
      </span>
    );

  return <img src={src} alt="" className="size-11 shrink-0 rounded-lg object-cover" />;
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="h-12 border-b border-line bg-surface-2/40" />
      <div className="divide-y divide-line">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 max-sm:px-4">
            <div className="size-11 shrink-0 animate-pulse rounded-lg bg-surface-2" />
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
