import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Inbox } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { Reveal } from "@/components/ui/Reveal";
import { leads, type LeadStatus } from "@/data/realtor";
import { propertyById } from "@/data/mock";
import { cn } from "@/lib/cn";

type Filter = "all" | LeadStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
];

export function RealtorLeads() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      responded: leads.filter((l) => l.status === "responded").length,
    }),
    [],
  );

  const list = filter === "all" ? leads : leads.filter((l) => l.status === filter);

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
        <div className="inline-flex rounded-full border border-line bg-surface-2/60 p-1">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
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

      {list.length ? (
        <Reveal y={16}>
          <DataTable
            minWidthClass="sm:min-w-[560px]"
            head={
              <tr>
                <th className={thCls}>Buyer</th>
                <th className={cn(thCls, "max-md:hidden")}>Listing</th>
                <th className={cn(thCls, "max-sm:hidden")}>Received</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "w-10")}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            }
          >
            {list.map((lead) => {
              const property = propertyById(lead.propertyId);
              return (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/realtor/leads/${lead.id}`)}
                  className={rowCls}
                >
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <img
                        src={lead.buyerAvatar}
                        alt=""
                        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-ink">{lead.buyerName}</p>
                        <p className="line-clamp-1 text-xs text-muted max-md:hidden">
                          {lead.message}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tdCls, "text-muted max-md:hidden")}>
                    <span className="line-clamp-1">{property?.title ?? "A listing"}</span>
                  </td>
                  <td className={cn(tdCls, "whitespace-nowrap text-muted max-sm:hidden")}>
                    {lead.at}
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
      ) : (
        <Reveal y={16}>
          <EmptyState
            icon={Inbox}
            title={filter === "new" ? "No new leads" : "No leads here"}
            message={
              filter === "new"
                ? "You're all caught up. New buyer inquiries will land here."
                : "Buyer inquiries on your listings will appear here as they come in."
            }
          />
        </Reveal>
      )}
    </div>
  );
}
