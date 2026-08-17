import type { ComponentType } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  Briefcase,
  Building2,
  CircleDot,
  ExternalLink,
  Eye,
  Languages,
  Layers,
  Mail,
  MapPin,
  MapPinned,
  MessageSquare,
  Phone,
  ShieldCheck,
  User,
  UsersRound,
} from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import {
  realtorById,
  adminRealtorProfile,
  certRecordFor,
  govIdStatusFor,
  listingsByRealtor,
  realtorPlan,
} from "@/data/admin";
import { cn } from "@/lib/cn";

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  max: "Max",
};

export function AdminRealtorDetail() {
  const { id } = useParams();
  const realtor = id ? realtorById(id) : undefined;

  if (!realtor) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <UsersRound className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Realtor not found</h1>
        <Link to="/admin/realtors" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to realtors
        </Link>
      </div>
    );
  }

  const r = realtor;
  const p = adminRealtorProfile(r);
  const cert = certRecordFor(r);
  const govId = govIdStatusFor(r);
  const listings = listingsByRealtor(r.id);
  const plan = PLAN_LABEL[realtorPlan[r.id] ?? "starter"];
  const avatar = `${r.avatar}?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80`;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/realtors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to realtors
      </Link>

      {/* hero */}
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="relative h-28 bg-linear-to-r from-brand/25 via-brand/10 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(26,172,240,0.25),transparent_60%)]" />
          </div>
          <div className="px-7 pb-7 max-sm:px-5">
            <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
              <div className="flex items-end gap-4 max-sm:items-center">
                <span className="relative -mt-12 shrink-0">
                  <img src={avatar} alt={r.name} className="size-24 rounded-2xl object-cover ring-4 ring-surface" />
                  {r.certified && (
                    <span
                      className="absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full bg-foil ring-2 ring-surface"
                      title="Certified realtor"
                    >
                      <BadgeCheck className="size-4 text-[#3a2c0f]" aria-hidden />
                    </span>
                  )}
                </span>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="display text-2xl text-ink">{r.name}</h2>
                    {r.certified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foil/15 px-2.5 py-0.5 text-xs font-semibold text-foil">
                        <BadgeCheck className="size-3.5" aria-hidden /> Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                        Not certified
                      </span>
                    )}
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                      {plan} plan
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {p.role} · {r.agency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 max-sm:w-full">
                <Link to={`/realtors/${r.id}`} className={cn(buttonClasses("outline", "md"), "max-sm:flex-1")}>
                  <Eye className="size-4" aria-hidden /> Public profile
                </Link>
                <button
                  onClick={() => toast.info(`${r.name} suspended.`)}
                  className={cn(buttonClasses("outline", "md"), "text-rose-500 hover:bg-rose-500/10 max-sm:flex-1")}
                >
                  <Ban className="size-4" aria-hidden /> Suspend
                </button>
              </div>
            </div>

            {/* quick facts */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-sm">
              <Fact icon={MapPin} text={`${p.address}`} />
              <Fact icon={Phone} text={p.phone} />
              <Fact icon={Mail} text={p.email} />
              <div className="ml-auto flex items-center gap-2 max-sm:ml-0">
                {p.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand/40 hover:text-brand-ink"
                  >
                    {s.label}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* track record */}
      <Reveal y={16}>
        <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          <StatTile Icon={BadgeCheck} value={r.verifiedListings} label="Verified listings" />
          <StatTile Icon={Briefcase} value={r.completedDeals} label="Deals closed" />
          <StatTile Icon={Building2} value={listings.length} label="Active listings" />
        </div>
      </Reveal>

      {/* self description */}
      <Reveal y={16}>
        <Panel title="Self description">
          <p className="leading-relaxed text-muted">{p.selfDescription}</p>
        </Panel>
      </Reveal>

      {/* professional details */}
      <Reveal y={16}>
        <Panel title="Professional details">
          <dl>
            <Detail icon={Briefcase} label="Experience" value={p.experience} />
            <div className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5">
              <dt className="flex items-center gap-2.5 text-sm text-muted">
                <Layers className="size-4 shrink-0 text-faint" aria-hidden />
                Specialization
              </dt>
              <dd className="flex flex-wrap justify-end gap-1.5">
                {p.specialization.length ? (
                  p.specialization.map((s) => (
                    <span key={s} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-ink">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-medium text-ink">—</span>
                )}
              </dd>
            </div>
            <Detail icon={Building2} label="Agency" value={r.agency} />
            <Detail icon={MapPinned} label="Agency address" value={p.agencyAddress} />
            <Detail icon={MapPin} label="Region" value={p.region} />
            <Detail icon={CircleDot} label="Subscription" value={`${plan} plan`} />
          </dl>
        </Panel>
      </Reveal>

      {/* additional details */}
      <Reveal y={16}>
        <Panel title="Additional details">
          <dl>
            <Detail icon={Languages} label="Languages spoken" value={p.languages} />
            <Detail icon={CircleDot} label="Availability" value={p.availabilityStatus} />
            <Detail icon={MessageSquare} label="Contact means" value={p.contactMeans} />
            <Detail icon={User} label="Gender" value={p.gender} />
            <Detail icon={MapPin} label="City" value={r.city} />
            <Detail icon={MapPin} label="State" value={p.state} />
            <Detail icon={MapPin} label="Country" value={p.country} />
            <Detail icon={CircleDot} label="Member since" value={p.memberSince} />
          </dl>
        </Panel>
      </Reveal>

      {/* certification */}
      <Reveal y={16}>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line bg-foil px-5 py-3">
            <BadgeCheck className="size-4 text-[#3a2c07]" aria-hidden />
            <p className="credential-meta text-xs text-[#3a2c07]">Certification</p>
          </div>
          <div className="p-6 max-sm:p-5">
            {cert.status === "certified" ? (
              <dl className="grid grid-cols-3 gap-x-8 gap-y-3 max-sm:grid-cols-1">
                <Detail icon={BadgeCheck} label="Status" value="Certified" />
                <Detail icon={ShieldCheck} label="Credential" value={cert.credentialId ?? "—"} />
                <Detail icon={CircleDot} label="Exam score" value={`${cert.examScore}%`} />
              </dl>
            ) : (
              <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                <p className="text-sm text-muted">
                  This realtor has not passed the certification exam yet, so their listings cannot go live.
                </p>
                <Button variant="brand" onClick={() => toast.success("Certification approved.")} className="shrink-0 max-sm:w-full">
                  <BadgeCheck className="size-4" aria-hidden />
                  Approve certification
                </Button>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* verification (government ID) */}
      <Reveal y={16}>
        <Panel title="Verification">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-ink">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Government-issued ID</p>
              <p className="text-xs text-muted">
                {govId === "verified" ? "Confirmed by our team." : "Submitted, under review by our team."}
              </p>
            </div>
            <StatusBadge status={govId} />
          </div>
        </Panel>
      </Reveal>

      {/* listings */}
      <Reveal y={16}>
        <Panel title={`Listings (${listings.length})`} bodyClassName="space-y-2.5">
          {listings.map((prop) => (
            <Link
              key={prop.id}
              to={`/admin/listings/${prop.id}`}
              className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
            >
              <img src={prop.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{prop.title}</p>
                <p className="truncate text-xs text-muted">{formatPrice(prop.price)}</p>
              </div>
              <StatusBadge status={prop.status} className="shrink-0" />
            </Link>
          ))}
        </Panel>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Fact({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted">
      <Icon className="size-4 shrink-0 text-faint" aria-hidden />
      {text}
    </span>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0">
      <dt className="flex items-center gap-2.5 text-sm text-muted">
        <Icon className="size-4 shrink-0 text-faint" aria-hidden />
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

function StatTile({
  Icon,
  value,
  label,
}: {
  Icon: ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand-ink">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
