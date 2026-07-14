import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/ui/Reveal";
import { DocCheckList } from "@/components/realtor/DocCheckList";
import { myListings } from "@/data/realtor";
import { propertyById } from "@/data/mock";
import { deriveDocChecks, type DocCheck } from "@/lib/listing";
import type { Property, VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

const STATUS_ORDER: Record<VerificationStatus, number> = { disputed: 0, pending: 1, verified: 2 };

const portfolio = myListings
  .map((l) => propertyById(l.id))
  .filter((p): p is Property => !!p)
  .map((p) => ({ property: p, checks: deriveDocChecks(p) }))
  .sort((a, b) => STATUS_ORDER[a.property.status] - STATUS_ORDER[b.property.status]);

const counts = {
  verified: portfolio.filter((l) => l.property.status === "verified").length,
  pending: portfolio.filter((l) => l.property.status === "pending").length,
  disputed: portfolio.filter((l) => l.property.status === "disputed").length,
};
const total = portfolio.length;
const verifiedRate = total ? Math.round((counts.verified / total) * 100) : 0;

type Filter = "all" | VerificationStatus;
const SEGMENTS: { key: Filter; label: string; activeCls: string }[] = [
  { key: "all", label: "All", activeCls: "bg-ink text-bg" },
  { key: "verified", label: "Verified", activeCls: "bg-verified text-white" },
  { key: "pending", label: "Pending", activeCls: "bg-gold text-white" },
  { key: "disputed", label: "Disputed", activeCls: "bg-rose-500 text-white" },
];

export function RealtorVerification() {
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(
    () => (filter === "all" ? portfolio : portfolio.filter((l) => l.property.status === filter)),
    [filter],
  );

  const segCount = (k: Filter) => (k === "all" ? total : counts[k]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Verification"
          subtitle="Every document behind your listings. Verified paperwork keeps a listing live and ranked in search."
        />
      </Reveal>

      {/* health thesis */}
      <Reveal y={16}>
        <Panel>
          <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-verified/10 text-verified">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="display text-3xl leading-none text-ink">
                <span className="tabular-nums">{verifiedRate}</span>
                <span className="text-xl text-muted">%</span>
                <span className="ml-3 align-middle text-sm font-normal text-muted">
                  of {total} listings verified
                </span>
              </p>
              <div className="mt-4 flex h-2.5 w-full max-w-md overflow-hidden rounded-full bg-surface-2">
                {(["verified", "pending", "disputed"] as VerificationStatus[]).map((k) =>
                  counts[k] > 0 ? (
                    <span
                      key={k}
                      className={cn(
                        k === "verified" && "bg-verified",
                        k === "pending" && "bg-gold",
                        k === "disputed" && "bg-rose-500",
                      )}
                      style={{ width: `${(counts[k] / total) * 100}%` }}
                    />
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* filter */}
      <Reveal y={16}>
        <div
          role="group"
          aria-label="Filter by verification status"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 max-sm:w-full max-sm:overflow-x-auto"
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

      {/* cards */}
      <div className="space-y-4">
        {list.map((l, i) => (
          <Reveal key={l.property.id} y={16} delay={Math.min(i, 6) * 0.04}>
            <VerificationCard property={l.property} checks={l.checks} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function VerificationCard({ property, checks }: { property: Property; checks: DocCheck[] }) {
  const verified = checks.filter((c) => c.state === "verified").length;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-4 border-b border-line p-5 max-sm:flex-wrap">
        <img
          src={property.image}
          alt={property.title}
          className="size-16 shrink-0 rounded-xl object-cover max-sm:size-14"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h3 className="truncate font-semibold text-ink">{property.title}</h3>
            <StatusBadge status={property.status} className="shrink-0" />
          </div>
          <p className="mt-1 truncate text-sm text-muted">
            {property.location}, {property.city}
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted max-sm:order-3 max-sm:w-full">
          <span className="font-semibold tabular-nums text-ink">{verified}</span> of{" "}
          <span className="tabular-nums">{checks.length}</span> verified
        </p>
      </div>

      <div className="px-5 py-3">
        <DocCheckList checks={checks} actions />
      </div>
    </article>
  );
}
