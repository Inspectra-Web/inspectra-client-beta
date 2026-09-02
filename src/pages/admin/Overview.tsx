import { Link } from "react-router";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Building2,
  CalendarCheck,
  MessageSquare,
  Repeat,
  ShieldCheck,
  TriangleAlert,
  UserPlus,
  UsersRound,
  UserX,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import {
  adminActivity,
  kpis,
  reviewQueue,
  type AdminActivityKind,
} from "@/data/admin";
import type { VerificationStatus } from "@/types";
import { useAuthUser } from "@/lib/auth";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const ACTIVITY_ICON: Record<AdminActivityKind, typeof ShieldCheck> = {
  verified: BadgeCheck,
  disputed: TriangleAlert,
  certified: ShieldCheck,
  listed: Building2,
  joined: UserPlus,
};

const ACTIVITY_TONE: Record<AdminActivityKind, string> = {
  verified: "bg-verified/12 text-verified",
  disputed: "bg-rose-500/12 text-rose-500",
  certified: "bg-brand/12 text-brand-ink",
  listed: "bg-surface-2 text-muted",
  joined: "bg-surface-2 text-muted",
};

export function AdminOverview() {
  const peek = reviewQueue.slice(0, 4);
  const firstName = displayName(useAuthUser().fullname).split(" ")[0];

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title={`${greeting()}, ${firstName}`}
          subtitle="The trust desk. Here is what is waiting on a human today."
        />
      </Reveal>

      {/* KPI row: the platform totals at a glance */}
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <Reveal y={16}>
          <StatCard
            icon={Building2}
            label="Properties"
            value={kpis.totalListings}
            hint="Listings on the platform"
            to="/admin/listings"
          />
        </Reveal>
        <Reveal y={16} delay={0.05}>
          <StatCard icon={MessageSquare} label="Leads" value={kpis.totalLeads} hint="Buyer inquiries" />
        </Reveal>
        <Reveal y={16} delay={0.1}>
          <StatCard icon={CalendarCheck} label="Inspections" value={kpis.totalInspections} hint="Booked viewings" />
        </Reveal>
        <Reveal y={16} delay={0.15}>
          <StatCard
            icon={UsersRound}
            label="Users"
            value={kpis.totalUsers}
            hint="Seekers, realtors, admins"
            to="/admin/users"
          />
        </Reveal>
      </div>

      {/* KPI row: realtor standing + revenue counts */}
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <Reveal y={16}>
          <StatCard
            icon={BadgeCheck}
            label="Certified realtors"
            value={kpis.certifiedRealtors}
            hint="Passed the exam"
            to="/admin/realtors"
          />
        </Reveal>
        <Reveal y={16} delay={0.05}>
          <StatCard
            icon={UserX}
            label="Not certified"
            value={kpis.notCertifiedRealtors}
            hint="Awaiting certification"
            to="/admin/realtors"
          />
        </Reveal>
        <Reveal y={16} delay={0.1}>
          <StatCard
            icon={Repeat}
            label="Subscriptions"
            value={kpis.activeSubscriptions}
            hint="Active paid plans"
            to="/admin/payments"
          />
        </Reveal>
        <Reveal y={16} delay={0.15}>
          <StatCard
            icon={Award}
            label="Certifications paid"
            value={kpis.certificationsPaid}
            hint="One-time fees collected"
            to="/admin/payments"
          />
        </Reveal>
      </div>

      {/* platform trust health */}
      <Reveal y={16}>
        <Panel>
          <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-verified/10 text-verified">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="display text-3xl leading-none text-ink">
                <span className="tabular-nums">{kpis.verifiedRate}</span>
                <span className="text-xl text-muted">%</span>
                <span className="ml-3 align-middle text-sm font-normal text-muted">
                  of {kpis.totalListings} listings verified and live
                </span>
              </p>
              <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                {([
                  ["verified", kpis.verified],
                  ["pending", kpis.pending],
                  ["disputed", kpis.disputed],
                ] as [VerificationStatus, number][]).map(([k, n]) =>
                  n > 0 ? (
                    <span
                      key={k}
                      className={cn(
                        k === "verified" && "bg-verified",
                        k === "pending" && "bg-gold",
                        k === "disputed" && "bg-rose-500",
                      )}
                      style={{ width: `${(n / kpis.totalListings) * 100}%` }}
                    />
                  ) : null,
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                <Legend tone="bg-verified" label={`${kpis.verified} verified`} />
                <Legend tone="bg-gold" label={`${kpis.pending} pending`} />
                <Legend tone="bg-rose-500" label={`${kpis.disputed} disputed`} />
              </div>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* queue peek + audit feed */}
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="col-span-2 max-lg:col-span-1">
          <Panel
            title="Needs a human"
            action={
              <Link to="/admin/verification" className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
                Full queue <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            }
            bodyClassName="space-y-3"
          >
            {peek.map((q) => (
              <div
                key={q.property.id}
                className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3 transition-colors hover:bg-surface-2/40 max-sm:flex-wrap"
              >
                <img
                  src={q.property.image}
                  alt={q.property.title}
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-ink">{q.property.title}</h3>
                    <StatusBadge status={q.property.status} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {q.realtor?.name ?? "Unknown realtor"} · submitted {q.submission?.submittedAt ?? "recently"}
                  </p>
                </div>
                <Link
                  to={`/admin/verification/${q.property.id}`}
                  className={buttonClasses("outline", "sm", "shrink-0 max-sm:w-full")}
                >
                  Review
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            ))}
          </Panel>
        </Reveal>

        <Reveal y={16} delay={0.05}>
          <Panel title="Audit feed" bodyClassName="space-y-1">
            {adminActivity.map((a) => {
              const Icon = ACTIVITY_ICON[a.kind];
              return (
                <div key={a.id} className="flex gap-3 py-2.5">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", ACTIVITY_TONE[a.kind])}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{a.text}</p>
                    <p className="text-xs text-faint">{a.at}</p>
                  </div>
                </div>
              );
            })}
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", tone)} aria-hidden />
      {label}
    </span>
  );
}
