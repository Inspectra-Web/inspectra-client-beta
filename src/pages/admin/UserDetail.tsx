import { useState, type ComponentType } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Briefcase,
  Building2,
  CalendarCheck,
  CircleCheck,
  Heart,
  Layers,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiMessage } from "@/lib/api";
import type { AuthRole, AuthStatus } from "@/lib/auth";
import { useAdminUser, useUpdateUserStatus, type UserDetail } from "@/lib/adminUsers";
import type { Profile } from "@/lib/profile";
import { displayName, formatDate, formatPhone } from "@/lib/format";
import { cn } from "@/lib/cn";

const ROLE_LABEL: Record<AuthRole, string> = { admin: "Admin", realtor: "Realtor", seeker: "Seeker" };
const ROLE_TONE: Record<AuthRole, string> = {
  admin: "bg-brand/12 text-brand-ink",
  realtor: "bg-verified/12 text-verified",
  seeker: "bg-surface-2 text-muted",
};
const STATUS_TONE: Record<AuthStatus, string> = {
  active: "text-verified",
  suspended: "text-rose-500",
  pending: "text-gold",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function AdminUserDetail() {
  const { id } = useParams();
  const { data, isPending, isError, error } = useAdminUser(id ?? "");

  if (isPending) return <DetailSkeleton />;

  if (isError)
    return (
      <NotFound
        title="User not found"
        message={apiMessage(error, "That account could not be loaded.")}
      />
    );

  return <UserDetailView key={data.user.id} detail={data} />;
}

function UserDetailView({ detail }: { detail: UserDetail }) {
  const { user, profile } = detail;
  const [confirming, setConfirming] = useState(false);
  const updateStatus = useUpdateUserStatus();

  const name = displayName(user.fullname);
  const suspended = user.status === "suspended";
  const locked = user.role === "admin";

  async function onToggleStatus() {
    try {
      const res = await updateStatus.mutateAsync({
        id: user.id,
        status: suspended ? "active" : "suspended",
      });
      toast.success(res.message ?? "Account updated.");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

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
                <UserAvatar
                  name={name}
                  avatar={user.avatar}
                  className="relative -mt-12 size-24 rounded-2xl text-xl ring-4 ring-surface"
                />
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="display text-2xl text-ink">{name}</h2>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", ROLE_TONE[user.role])}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <p className={cn("mt-1 inline-flex items-center gap-1.5 text-sm font-medium", STATUS_TONE[user.status])}>
                    <span className="size-1.5 rounded-full bg-current" aria-hidden />
                    {cap(user.status)} · joined {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {!locked && (
                <Button
                  variant="outline"
                  disabled={updateStatus.isPending}
                  className={cn("max-sm:w-full", suspended ? "text-verified hover:bg-verified/10" : "text-rose-500 hover:bg-rose-500/10")}
                  onClick={() => setConfirming(true)}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : suspended ? (
                    <CircleCheck className="size-4" aria-hidden />
                  ) : (
                    <Ban className="size-4" aria-hidden />
                  )}
                  {suspended ? "Reactivate" : "Suspend"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* account details */}
      <Reveal y={16}>
        <Panel title="Account details">
          <dl>
            <Detail icon={Mail} label="Email" value={user.email} />
            <Detail
              icon={ShieldCheck}
              label="Email verified"
              value={user.emailVerified ? "Yes" : "No"}
            />
            <Detail
              icon={Phone}
              label="Phone"
              value={user.phone ? formatPhone(user.phone) : ""}
            />
            <Detail icon={UserRound} label="Role" value={ROLE_LABEL[user.role]} />
            <Detail icon={MapPin} label="City" value={profile?.city ?? ""} />
            <Detail icon={CalendarCheck} label="Member since" value={formatDate(user.createdAt)} />
          </dl>
        </Panel>
      </Reveal>

      {/* role-specific */}
      {user.role === "realtor" && <RealtorSection profile={profile} />}
      {user.role === "seeker" && <SeekerSection profile={profile} />}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={suspended ? `Reactivate ${name}?` : `Suspend ${name}?`}
        description={
          suspended
            ? "They will be able to sign in again straight away."
            : "They are signed out immediately and cannot sign in until you reactivate the account."
        }
        confirmLabel={suspended ? "Reactivate" : "Suspend"}
        destructive={!suspended}
        pending={updateStatus.isPending}
        onConfirm={onToggleStatus}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RealtorSection({ profile }: { profile: Profile | null }) {
  return (
    <Reveal y={16}>
      <Panel title="Realtor account">
        {profile ? (
          <dl>
            <Detail
              icon={BadgeCheck}
              label="Certification"
              value={profile.certified ? "Certified" : "Not certified"}
            />
            <Detail icon={Building2} label="Agency" value={profile.agencyName} />
            <Detail icon={MapPinned} label="Agency address" value={profile.agencyAddress} />
            <Detail icon={UserRound} label="Job title" value={profile.jobTitle} />
            <Detail icon={Briefcase} label="Experience" value={profile.experience} />
            <Detail icon={MapPin} label="Region" value={profile.region} />
            <Chips icon={Layers} label="Specialization" values={profile.specialization} />
          </dl>
        ) : (
          <EmptyProfile />
        )}
      </Panel>
    </Reveal>
  );
}

function SeekerSection({ profile }: { profile: Profile | null }) {
  return (
    <Reveal y={16}>
      <Panel title="Search preferences">
        {profile ? (
          <dl>
            <Detail icon={MapPin} label="Preferred city" value={profile.preferredCity} />
            <Chips icon={Heart} label="Property interests" values={profile.propertyInterests} />
            <Chips icon={Layers} label="Categories" values={profile.propertyCategories} />
          </dl>
        ) : (
          <EmptyProfile />
        )}
      </Panel>
    </Reveal>
  );
}

function EmptyProfile() {
  return (
    <p className="text-sm text-muted">
      This account has no profile yet. One is created the first time they open their account
      page.
    </p>
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

function Chips({
  icon: Icon,
  label,
  values,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  values: string[];
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0">
      <dt className="flex items-center gap-2.5 text-sm text-muted">
        <Icon className="size-4 shrink-0 text-faint" aria-hidden />
        {label}
      </dt>
      <dd className="flex flex-wrap justify-end gap-1.5">
        {values.length ? (
          values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium capitalize text-brand-ink"
            >
              {value}
            </span>
          ))
        ) : (
          <span className="text-sm font-medium text-ink">{"—"}</span>
        )}
      </dd>
    </div>
  );
}

function NotFound({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <UsersRound className="size-7" />
      </span>
      <h1 className="display mt-5 text-3xl text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-muted">{message}</p>
      <Link to="/admin/users" className={buttonClasses("brand", "md", "mt-7")}>
        <ArrowLeft className="size-4" aria-hidden />
        Back to users
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-32 animate-pulse rounded bg-surface-2" />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="h-28 animate-pulse bg-surface-2" />
        <div className="flex items-end gap-4 px-7 pb-7 max-sm:px-5">
          <div className="-mt-12 size-24 shrink-0 animate-pulse rounded-2xl bg-surface-2 ring-4 ring-surface" />
          <div className="space-y-2 pb-1">
            <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
      <Panel title="Account details">
        <div className="h-56 animate-pulse rounded-xl bg-surface-2" />
      </Panel>
    </div>
  );
}

