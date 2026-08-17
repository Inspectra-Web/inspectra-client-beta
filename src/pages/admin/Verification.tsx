import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { reviewQueue, kpis, queueCount } from "@/data/admin";
import { deriveDocChecks } from "@/lib/listing";
import { cn } from "@/lib/cn";

type Filter = "all" | "pending" | "disputed";

const SEGMENTS: { key: Filter; label: string; activeCls: string }[] = [
  { key: "all", label: "All", activeCls: "bg-ink text-bg" },
  { key: "pending", label: "Pending", activeCls: "bg-gold text-white" },
  { key: "disputed", label: "Disputed", activeCls: "bg-rose-500 text-white" },
];

export function AdminVerification() {
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(
    () => (filter === "all" ? reviewQueue : reviewQueue.filter((q) => q.property.status === filter)),
    [filter],
  );

  const segCount = (k: Filter) =>
    k === "all" ? queueCount : k === "pending" ? kpis.pending : kpis.disputed;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Verification queue"
          subtitle="Every listing waiting on a decision. Approve the paperwork to mint the Verified badge, or flag it back to the realtor."
        />
      </Reveal>

      <Reveal y={16}>
        <div
          role="group"
          aria-label="Filter by verification status"
          className="no-scrollbar inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 max-sm:w-full max-sm:overflow-x-auto"
        >
          {SEGMENTS.map((s) => {
            const active = filter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilter(s.key)}
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

      {list.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Queue is clear"
          message="Nothing is waiting on a decision right now. Every live listing is verified."
        />
      ) : (
        <div className="space-y-4">
          {list.map((q, i) => {
            const checks = deriveDocChecks(q.property);
            const done = checks.filter((c) => c.state === "verified").length;
            return (
              <Reveal key={q.property.id} y={16} delay={Math.min(i, 6) * 0.04}>
                <Link
                  to={`/admin/verification/${q.property.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)] max-sm:flex-wrap"
                >
                  <img
                    src={q.property.image}
                    alt={q.property.title}
                    className="size-16 shrink-0 rounded-xl object-cover max-sm:size-14"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="truncate font-semibold text-ink">{q.property.title}</h3>
                      <StatusBadge status={q.property.status} className="shrink-0" />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">
                      {q.realtor?.name ?? "Unknown realtor"} · {q.property.location}, {q.property.city}
                    </p>
                    {q.submission?.note && (
                      <p className="mt-1 truncate text-xs text-faint">{q.submission.note}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-5 max-sm:w-full max-sm:justify-between">
                    <div className="text-right max-sm:text-left">
                      <p className="text-sm font-semibold tabular-nums text-ink">
                        {done} of {checks.length}
                      </p>
                      <p className="text-xs text-faint">docs cleared</p>
                    </div>
                    <span className="text-xs text-faint">{q.submission?.submittedAt}</span>
                    <span className={buttonClasses("outline", "sm", "shrink-0 group-hover:border-brand/40")}>
                      Review
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
