import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Inbox, SearchX } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import { displayName, timeAgo } from "@/lib/format";
import {
  useLeads,
  EMPTY_QUERY,
  PAGE_SIZE,
  type InquiryQuery,
  type InquiryStatus,
} from "@/lib/inquiries";
import { cn } from "@/lib/cn";

type Filter = "all" | InquiryStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
  { key: "closed", label: "Closed" },
];

export function RealtorLeads() {
  const navigate = useNavigate();
  const [query, setQuery] = useState<InquiryQuery>(EMPTY_QUERY);

  const { data, isPending, isError, error, isPlaceholderData } = useLeads(query);

  const leads = data?.leads ?? [];
  const counts = data?.counts ?? { all: 0, new: 0, responded: 0, closed: 0 };
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.status !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Leads"
          subtitle="Buyer inquiries on your listings. A fast reply is the difference between a viewing and a lost deal."
        />
      </Reveal>

      {/* filter */}
      <Reveal y={16}>
        <div
          role="group"
          aria-label="Filter leads"
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
            icon={Inbox}
            title="Could not load your leads"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : leads.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={filtered ? SearchX : Inbox}
            title={filtered ? "Nothing in this filter" : "No leads yet"}
            message={
              filtered
                ? "Clear the filter to see every conversation on your listings."
                : "Buyer inquiries on your listings will appear here as they come in."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => setQuery((prev) => ({ ...prev, status: "all", page: 1 }))}
                >
                  Clear filter
                </Button>
              ) : undefined
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[560px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>Buyer</th>
                <th className={cn(thCls, "max-md:hidden")}>Listing</th>
                <th className={cn(thCls, "max-sm:hidden")}>L. MESSAGE</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "w-10")}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            }
          >
            {leads.map((lead, i) => {
              const name = displayName(lead.seeker.fullname);

              return (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/realtor/leads/${lead.id}`)}
                  className={rowCls}
                >
                  <td className={cn(tdCls, "tabular-nums text-muted")}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={name}
                        avatar={lead.seeker.avatar}
                        className="size-9"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-ink">{name}</p>
                        <p className="line-clamp-1 text-xs text-muted max-md:hidden">
                          {lead.lastMessage}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tdCls, "text-muted max-md:hidden")}>
                    <span className="line-clamp-1">{lead.property.title}</span>
                  </td>
                  <td className={cn(tdCls, "whitespace-nowrap text-muted max-sm:hidden")}>
                    {timeAgo(lead.lastMessageAt)}
                  </td>
                  <td className={tdCls}>
                    <StatusPill status={lead.status} />
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

      {!isError && !isPending && leads.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{leads.length}</span> of{" "}
            {total} {total === 1 ? "lead" : "leads"}
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
          <div key={i} className="flex items-center gap-3 px-5 py-4 max-sm:px-4">
            <div className="size-9 shrink-0 animate-pulse rounded-full bg-surface-2" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-56 animate-pulse rounded bg-surface-2" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-2 max-sm:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
}
