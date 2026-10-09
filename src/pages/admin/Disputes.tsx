import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Scale, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { apiMessage } from "@/lib/api";
import {
  useAdminDisputes,
  DISPUTES_QUERY,
  PAGE_SIZE,
  type DisputeOutcome,
  type DisputeQuery,
} from "@/lib/adminDisputes";
import { displayName, formatDate, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

export const OUTCOME_LABEL: Record<DisputeOutcome, string> = {
  release: "Paid to realtor",
  refund: "Refunded to seeker",
  split: "Split",
};

export function AdminDisputes() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<DisputeQuery>(DISPUTES_QUERY);
  const [stateOpen, setStateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminDisputes(query);

  const rows = data?.disputes ?? [];
  const counts = data?.counts;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.q !== "" || query.state !== "open";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Disputes"
          subtitle="Paid viewings whose two sides disagree. The fee stays frozen until you decide; aim for 5 business days."
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
              placeholder="Search by listing, reference, buyer or realtor…"
              aria-label="Search disputes"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="State"
            open={stateOpen}
            onOpenChange={setStateOpen}
            value={query.state}
            onChange={(state) =>
              setQuery((prev) => ({ ...prev, state: state as DisputeQuery["state"], page: 1 }))
            }
            options={[
              { value: "open", label: counts ? `Open (${counts.open})` : "Open" },
              { value: "decided", label: counts ? `Decided (${counts.decided})` : "Decided" },
              { value: "all", label: counts ? `All disputes (${counts.all})` : "All disputes" },
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState icon={Scale} title="Could not load disputes" message={apiMessage(error)} />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={Scale}
            title={filtered ? "No matching disputes" : "No open disputes"}
            message={
              filtered
                ? "Nothing matches those filters. Try a different search or widen them."
                : "When a buyer and a realtor disagree about a paid viewing, it lands here."
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[860px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>Viewing</th>
                <th className={cn(thCls, "max-md:hidden")}>Buyer</th>
                <th className={cn(thCls, "max-md:hidden")}>Realtor</th>
                <th className={thCls}>Paid</th>
                <th className={cn(thCls, "max-lg:hidden")}>Opened</th>
                <th className={thCls}>State</th>
              </tr>
            }
          >
            {rows.map((d, i) => (
              <tr key={d.id} className={rowCls} onClick={() => navigate(`/admin/disputes/${d.id}`)}>
                <td className={cn(tdCls, "tabular-nums text-muted")}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className={tdCls}>
                  <p className="truncate font-medium text-ink">{d.property.title}</p>
                  <p className="truncate text-xs text-muted">
                    {d.property.ref} · viewing {formatDate(d.slot)}
                  </p>
                </td>
                <td className={cn(tdCls, "text-sm text-ink max-md:hidden")}>{displayName(d.seeker.fullname)}</td>
                <td className={cn(tdCls, "text-sm text-ink max-md:hidden")}>{displayName(d.realtor.fullname)}</td>
                <td className={cn(tdCls, "font-medium tabular-nums text-ink")}>{formatPriceFull(d.total)}</td>
                <td className={cn(tdCls, "text-sm text-muted max-lg:hidden")}>{formatDate(d.openedAt)}</td>
                <td className={tdCls}>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      d.state === "open" ? "bg-rose-500/10 text-rose-500" : "bg-verified/12 text-verified",
                    )}
                  >
                    {d.state === "open" ? "Open" : d.outcome ? OUTCOME_LABEL[d.outcome] : "Decided"}
                  </span>
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
            {total === 1 ? "dispute" : "disputes"}
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
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 max-sm:px-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-48 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-64 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
