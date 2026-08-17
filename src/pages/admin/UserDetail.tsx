import type { ComponentType } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CircleCheck,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import {
  userById,
  realtorById,
  realtorPlan,
  certRecordFor,
  type DirectoryUser,
  type UserRole,
  type UserStatus,
} from "@/data/admin";
import { savedPropertyIds, inquiries, inspections } from "@/data/seeker";
import { cn } from "@/lib/cn";

const ROLE_LABEL: Record<UserRole, string> = { admin: "Admin", realtor: "Realtor", seeker: "Seeker" };
const ROLE_TONE: Record<UserRole, string> = {
  admin: "bg-brand/12 text-brand-ink",
  realtor: "bg-verified/12 text-verified",
  seeker: "bg-surface-2 text-muted",
};
const STATUS_TONE: Record<UserStatus, string> = {
  active: "text-verified",
  suspended: "text-rose-500",
  pending: "text-gold",
};
const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  max: "Max",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function AdminUserDetail() {
  const { id } = useParams();
  const user = id ? userById(id) : undefined;

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <UsersRound className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">User not found</h1>
        <Link to="/admin/users" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to users
        </Link>
      </div>
    );
  }

  const suspended = user.status === "suspended";

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to users
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
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="-mt-12 size-24 shrink-0 rounded-2xl object-cover ring-4 ring-surface"
                />
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="display text-2xl text-ink">{user.name}</h2>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", ROLE_TONE[user.role])}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <p className={cn("mt-1 inline-flex items-center gap-1.5 text-sm font-medium", STATUS_TONE[user.status])}>
                    <span className="size-1.5 rounded-full bg-current" aria-hidden />
                    {cap(user.status)} · joined {user.joined}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className={cn("max-sm:w-full", suspended ? "text-verified hover:bg-verified/10" : "text-rose-500 hover:bg-rose-500/10")}
                onClick={() => toast.info(suspended ? `${user.name} reactivated.` : `${user.name} suspended.`)}
              >
                {suspended ? <CircleCheck className="size-4" aria-hidden /> : <Ban className="size-4" aria-hidden />}
                {suspended ? "Reactivate" : "Suspend"}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* account details */}
      <Reveal y={16}>
        <Panel title="Account details">
          <dl>
            <Detail icon={Mail} label="Email" value={user.email} />
            <Detail icon={UserRound} label="Role" value={ROLE_LABEL[user.role]} />
            <Detail icon={MapPin} label="City" value={user.city} />
            <Detail icon={ShieldCheck} label="Status" value={cap(user.status)} />
            <Detail icon={CalendarCheck} label="Member since" value={user.joined} />
            <Detail icon={UsersRound} label="User ID" value={user.id} />
          </dl>
        </Panel>
      </Reveal>

      {/* role-specific */}
      {user.role === "realtor" && <RealtorSection user={user} />}
      {user.role === "seeker" && <SeekerSection user={user} />}
      {user.role === "admin" && <AdminSection />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RealtorSection({ user }: { user: DirectoryUser }) {
  const realtor = user.refId ? realtorById(user.refId) : undefined;
  if (!realtor) return null;
  const cert = certRecordFor(realtor);
  const plan = PLAN_LABEL[realtorPlan[realtor.id] ?? "starter"];

  return (
    <Reveal y={16}>
      <Panel
        title="Realtor account"
        action={
          <Link
            to={`/admin/realtors/${realtor.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
          >
            Full profile <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        }
      >
        <dl className="mb-5">
          <Detail icon={Building2} label="Agency" value={realtor.agency} />
          <Detail
            icon={BadgeCheck}
            label="Certification"
            value={cert.status === "certified" ? "Certified" : "Not certified"}
          />
          <Detail icon={ShieldCheck} label="Subscription" value={`${plan} plan`} />
        </dl>
        <div className="grid grid-cols-2 gap-4">
          <StatTile Icon={BadgeCheck} value={realtor.verifiedListings} label="Verified listings" />
          <StatTile Icon={Building2} value={realtor.completedDeals} label="Deals closed" />
        </div>
      </Panel>
    </Reveal>
  );
}

function SeekerSection({ user }: { user: DirectoryUser }) {
  // Only the primary sample seeker carries activity data; other seeker accounts read as new.
  const primary = user.id === "u-seeker";
  const saved = primary ? savedPropertyIds.length : 0;
  const inqs = primary ? inquiries.length : 0;
  const insp = primary ? inspections.length : 0;

  return (
    <Reveal y={16}>
      <Panel title="Buyer activity">
        <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          <StatTile Icon={Heart} value={saved} label="Saved homes" />
          <StatTile Icon={MessageSquare} value={inqs} label="Inquiries sent" />
          <StatTile Icon={CalendarCheck} value={insp} label="Inspections booked" />
        </div>
        {!primary && (
          <p className="mt-4 text-sm text-muted">No recent activity on this account yet.</p>
        )}
      </Panel>
    </Reveal>
  );
}

function AdminSection() {
  return (
    <Reveal y={16}>
      <Panel title="Administrator">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-ink">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Platform administrator</p>
            <p className="text-xs text-muted">Full access to the Trust Operations console.</p>
          </div>
        </div>
      </Panel>
    </Reveal>
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
      <dd className="break-all text-right text-sm font-medium text-ink">{value || "—"}</dd>
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
