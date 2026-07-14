import { Link } from "react-router";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Eye,
  Inbox,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Reveal } from "@/components/ui/Reveal";
import {
  realtor,
  myListings,
  leads,
  newLeadCount,
  upcomingRealtorInspections,
  realtorActivity,
  type RealtorActivityKind,
} from "@/data/realtor";
import { propertyById } from "@/data/mock";
import type { VerificationStatus } from "@/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Resolve the portfolio against real properties, then tally verification states.
const portfolio = myListings
  .map((l) => ({ ...l, property: propertyById(l.id) }))
  .filter((l): l is typeof l & { property: NonNullable<typeof l.property> } => !!l.property);

const total = portfolio.length;
const counts: Record<VerificationStatus, number> = { verified: 0, pending: 0, disputed: 0 };
portfolio.forEach((l) => (counts[l.property.status] += 1));
const verifiedRate = total ? Math.round((counts.verified / total) * 100) : 0;
const needAttention = counts.pending + counts.disputed;

export function RealtorOverview() {
  const firstName = realtor.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title={`${greeting()}, ${firstName}`}
          subtitle="Here's how your portfolio and pipeline are doing today."
        />
      </Reveal>

      {/* stats */}
      <Reveal className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1" y={16}>
        <StatCard icon={Building2} label="Active listings" value={total} to="/realtor/listings" />
        <StatCard
          icon={Inbox}
          label="New leads"
          value={newLeadCount}
          hint={newLeadCount > 0 ? "Awaiting your reply" : "All caught up"}
          to="/realtor/leads"
        />
        <StatCard
          icon={CalendarCheck}
          label="Upcoming inspections"
          value={upcomingRealtorInspections.length}
          to="/realtor/inspections"
        />
      </Reveal>

      {/* verification health (signature) + activity */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-6 max-lg:grid-cols-1">
        <Reveal y={16}>
          <VerificationPanel />
        </Reveal>
        <Reveal y={16}>
          <Panel title="Recent activity" className="h-full">
            <ActivityFeed />
          </Panel>
        </Reveal>
      </div>

      {/* leads + inspections */}
      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <Reveal y={16}>
          <Panel
            title="Leads to respond"
            action={<PanelLink to="/realtor/leads">View all</PanelLink>}
            className="h-full"
          >
            <LeadsList />
          </Panel>
        </Reveal>
        <Reveal y={16}>
          <Panel
            title="Upcoming inspections"
            action={<PanelLink to="/realtor/inspections">View all</PanelLink>}
            className="h-full"
          >
            <InspectionsList />
          </Panel>
        </Reveal>
      </div>

      {/* portfolio */}
      <Reveal y={16}>
        <Panel
          title="Your listings"
          action={<PanelLink to="/realtor/listings">Manage all</PanelLink>}
        >
          <ListingsList />
        </Panel>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PanelLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-brand-ink hover:underline">
      {children}
    </Link>
  );
}

/** Signature: the realtor's verification standing across their portfolio. */
function VerificationPanel() {
  const segments: { key: VerificationStatus; className: string; label: string }[] = [
    { key: "verified", className: "bg-verified", label: "Verified" },
    { key: "pending", className: "bg-gold", label: "Pending" },
    { key: "disputed", className: "bg-rose-500", label: "Disputed" },
  ];

  return (
    <Panel title="Portfolio verification" className="h-full">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="display text-4xl leading-none text-ink">
            <span className="tabular-nums">{verifiedRate}</span>
            <span className="text-2xl text-muted">%</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            of your {total} listings are verified
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl bg-verified/10 text-verified">
          <ShieldCheck className="size-5.5" />
        </span>
      </div>

      {/* segmented bar */}
      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
        {segments.map((s) =>
          counts[s.key] > 0 ? (
            <span
              key={s.key}
              className={s.className}
              style={{ width: `${(counts[s.key] / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      {/* legend */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span className={`size-2.5 rounded-full ${s.className}`} aria-hidden />
            <span className="text-muted">{s.label}</span>
            <span className="font-semibold tabular-nums text-ink">{counts[s.key]}</span>
          </li>
        ))}
      </ul>

      {needAttention > 0 && (
        <Link
          to="/realtor/verification"
          className="mt-5 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-3.5 transition-colors hover:border-gold/50"
        >
          <TriangleAlert className="size-5 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {needAttention} {needAttention === 1 ? "listing needs" : "listings need"} attention
            </p>
            <p className="text-xs text-muted">
              Complete verification to keep them live in search.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-brand-ink" />
        </Link>
      )}
    </Panel>
  );
}

const ACTIVITY_ICON: Record<RealtorActivityKind, typeof Inbox> = {
  lead: Inbox,
  inspection: CalendarCheck,
  verified: ShieldCheck,
  listed: Building2,
};

function ActivityFeed() {
  return (
    <ul>
      {realtorActivity.map((a, i) => {
        const Icon = ACTIVITY_ICON[a.kind];
        const isLast = i === realtorActivity.length - 1;
        return (
          <li key={a.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span className="absolute bottom-0 left-4 top-9 w-px bg-line" aria-hidden />
            )}
            <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-brand-ink">
              <Icon className="size-4" />
            </span>
            <div className="pt-1">
              <p className="text-sm leading-snug text-ink">{a.text}</p>
              <p className="mt-0.5 text-xs text-faint">{a.at}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function LeadsList() {
  return (
    <ul className="space-y-3">
      {leads.slice(0, 3).map((lead) => {
        const property = propertyById(lead.propertyId);
        return (
          <li key={lead.id}>
            <Link
              to="/realtor/leads"
              className="flex gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
            >
              <img
                src={lead.buyerAvatar}
                alt={lead.buyerName}
                className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{lead.buyerName}</p>
                  <StatusPill status={lead.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-faint">
                  {property?.title ?? "A listing"}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-muted">{lead.message}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function InspectionsList() {
  return (
    <ul className="space-y-3">
      {upcomingRealtorInspections.map((ins) => {
        const property = propertyById(ins.propertyId);
        const ModeIcon = ins.mode === "virtual" ? Video : MapPin;
        const modeLabel = ins.mode === "virtual" ? "Virtual tour" : "In-person visit";
        return (
          <li key={ins.id}>
            <Link
              to="/realtor/inspections"
              className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
            >
              <DateBlock date={ins.date} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{property?.title ?? "A listing"}</p>
                <p className="mt-0.5 truncate text-sm text-muted">
                  {ins.time} with {ins.buyerName}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-brand-ink">
                  <ModeIcon className="size-3.5" />
                  {modeLabel}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ListingsList() {
  return (
    <ul className="space-y-2.5">
      {portfolio.map((l) => (
        <li key={l.id}>
          <Link
            to={`/listings/${l.id}`}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface-2/40 p-3.5 transition-colors hover:border-brand/40"
          >
            <img
              src={l.property.image}
              alt={l.property.title}
              className="size-16 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{l.property.title}</p>
              <p className="mt-0.5 truncate text-sm text-muted">
                {l.property.location}, {l.property.city}
              </p>
            </div>

            <div className="ml-2 hidden items-center gap-2 pr-3 md:flex">
              <Metric Icon={Eye} label="Views" value={l.views.toLocaleString()} />
              <Metric Icon={Inbox} label="Leads" value={l.leads} />
            </div>

            <StatusBadge status={l.property.status} className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Metric({
  Icon,
  label,
  value,
}: {
  Icon: typeof Eye;
  label: string;
  value: string | number;
}) {
  return (
    <div className="w-16 text-center">
      <p className="text-base font-semibold tabular-nums leading-none text-ink">{value}</p>
      <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-faint">
        <Icon className="size-3.5" />
        {label}
      </p>
    </div>
  );
}
