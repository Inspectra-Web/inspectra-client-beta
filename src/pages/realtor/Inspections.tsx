import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarCheck, ChevronRight, MapPin, Video } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { Reveal } from "@/components/ui/Reveal";
import { realtorInspections } from "@/data/realtor";
import { propertyById } from "@/data/mock";
import { cn } from "@/lib/cn";

type Tab = "upcoming" | "past";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function shortDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]}`;
}

export function RealtorInspections() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");

  const counts = useMemo(
    () => ({
      upcoming: realtorInspections.filter((i) => i.status === "upcoming").length,
      past: realtorInspections.filter((i) => i.status !== "upcoming").length,
    }),
    [],
  );

  const list = realtorInspections
    .filter((i) => (tab === "upcoming" ? i.status === "upcoming" : i.status !== "upcoming"))
    .sort((a, b) =>
      tab === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Inspections"
          subtitle="Viewings buyers have booked on your listings, in person and virtual."
        />
      </Reveal>

      {/* tabs */}
      <Reveal y={16}>
        <div className="inline-flex rounded-full border border-line bg-surface-2/60 p-1">
          {(["upcoming", "past"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  active ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
                )}
              >
                {t}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-brand/15 text-brand-ink" : "bg-surface-2 text-faint",
                  )}
                >
                  {counts[t]}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {list.length ? (
        <Reveal y={16}>
          <DataTable
            minWidthClass="sm:min-w-[620px]"
            head={
              <tr>
                <th className={thCls}>Date</th>
                <th className={thCls}>Listing</th>
                <th className={cn(thCls, "max-md:hidden")}>Buyer</th>
                <th className={cn(thCls, "max-sm:hidden")}>Mode</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "w-10")}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            }
          >
            {list.map((ins) => {
              const property = propertyById(ins.propertyId);
              const ModeIcon = ins.mode === "virtual" ? Video : MapPin;
              return (
                <tr
                  key={ins.id}
                  onClick={() => navigate(`/realtor/inspections/${ins.id}`)}
                  className={rowCls}
                >
                  <td className={cn(tdCls, "whitespace-nowrap")}>
                    <p className="font-semibold text-ink">{shortDate(ins.date)}</p>
                    <p className="text-xs text-muted">{ins.time}</p>
                  </td>
                  <td className={cn(tdCls, "text-ink")}>
                    <span className="line-clamp-1 font-medium">
                      {property?.title ?? "A listing"}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted md:hidden">
                      {ins.buyerName}
                    </span>
                  </td>
                  <td className={cn(tdCls, "text-muted max-md:hidden")}>{ins.buyerName}</td>
                  <td className={cn(tdCls, "max-sm:hidden")}>
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <ModeIcon className="size-4 text-brand-ink" aria-hidden />
                      {ins.mode === "virtual" ? "Virtual" : "In-person"}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <StatusPill status={ins.status} />
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
            icon={CalendarCheck}
            title={tab === "upcoming" ? "No upcoming inspections" : "No past inspections"}
            message={
              tab === "upcoming"
                ? "When a buyer books a viewing on one of your listings, it will show up here."
                : "Completed and cancelled viewings are archived here."
            }
          />
        </Reveal>
      )}
    </div>
  );
}
