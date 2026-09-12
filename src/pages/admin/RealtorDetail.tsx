import { useState, type ComponentType } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  CircleCheck,
  CircleDot,
  ExternalLink,
  Languages,
  Layers,
  Loader2,
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
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import { useAdminUser, useUpdateUserStatus, type UserDetail } from "@/lib/adminUsers";
import { documentLabel } from "@/lib/identity";
import { displayName, formatDate, formatPhone } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AdminRealtorDetail() {
  const { id } = useParams();
  const { data, isPending, isError, error } = useAdminUser(id ?? "");

  if (isPending) return <DetailSkeleton />;

  if (isError)
    return (
      <NotFound message={apiMessage(error, "That realtor could not be loaded.")} />
    );

  if (data.user.role !== "realtor")
    return (
      <NotFound message="That account exists, but it is not a realtor." />
    );

  return <RealtorDetailView key={data.user.id} detail={data} />;
}

function RealtorDetailView({ detail }: { detail: UserDetail }) {
  const { user, profile, identity } = detail;
  const [confirming, setConfirming] = useState(false);
  const updateStatus = useUpdateUserStatus();

  const name = displayName(user.fullname);
  const suspended = user.status === "suspended";
  const certified = profile?.certified ?? false;

  const socials = Object.entries(profile?.socials ?? {}).filter(([, href]) => href);

  async function onToggleStatus() {
    try {
      const res = await updateStatus.mutateAsync({
        id: user.id,
        status: suspended ? "active" : "suspended",
      });
      toast.success(res.message ?? "Account updated.");
    } catch (err) {
      toast.error(apiMessage(err));
    }
  }

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
                  <UserAvatar
                    name={name}
                    avatar={user.avatar}
                    className="size-24 rounded-2xl text-xl ring-4 ring-surface"
                  />
                  {certified && (
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
                    {/* The badge goes on the name, never on the picture: the avatar
                        is editable, the verified state is not. */}
                    <h2 className="display text-2xl text-ink">{name}</h2>
                    {certified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foil/15 px-2.5 py-0.5 text-xs font-semibold text-foil">
                        <BadgeCheck className="size-3.5" aria-hidden /> Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                        Not certified
                      </span>
                    )}
                    {suspended && (
                      <span className="inline-flex items-center rounded-full bg-rose-500/12 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {[profile?.jobTitle, profile?.agencyName].filter(Boolean).join(" · ") ||
                      "No agency on file"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                disabled={updateStatus.isPending}
                className={cn(
                  "max-sm:w-full",
                  suspended ? "text-verified hover:bg-verified/10" : "text-rose-500 hover:bg-rose-500/10",
                )}
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
            </div>

            {/* quick facts */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-sm">
              <Fact icon={Mail} text={user.email} />
              {user.phone && <Fact icon={Phone} text={formatPhone(user.phone)} />}
              {profile?.address && <Fact icon={MapPin} text={profile.address} />}
              {socials.length > 0 && (
                <div className="ml-auto flex items-center gap-2 max-sm:ml-0">
                  {socials.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium capitalize text-muted transition-colors hover:border-brand/40 hover:text-brand-ink"
                    >
                      {label}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {profile?.bio && (
        <Reveal y={16}>
          <Panel title="Self description">
            {/* The bio carries its own line breaks, which HTML would otherwise collapse. */}
            <p className="whitespace-pre-line leading-relaxed text-muted">{profile.bio}</p>
          </Panel>
        </Reveal>
      )}

      {/* professional details */}
      <Reveal y={16}>
        <Panel title="Professional details">
          {profile ? (
            <dl>
              <Detail icon={Briefcase} label="Experience" value={profile.experience} />
              <Chips icon={Layers} label="Specialization" values={profile.specialization} />
              <Detail icon={Building2} label="Agency" value={profile.agencyName} />
              <Detail icon={MapPinned} label="Agency address" value={profile.agencyAddress} />
              <Detail icon={MapPin} label="Region" value={profile.region} />
            </dl>
          ) : (
            <EmptyProfile />
          )}
        </Panel>
      </Reveal>

      {/* additional details */}
      <Reveal y={16}>
        <Panel title="Additional details">
          <dl>
            <Detail icon={Languages} label="Language" value={profile?.language ?? ""} />
            <Detail icon={CircleDot} label="Availability" value={profile?.availabilityStatus ?? ""} />
            <Detail icon={MessageSquare} label="Contact means" value={profile?.contactMeans ?? ""} />
            <Detail icon={User} label="Gender" value={profile?.gender ?? ""} />
            <Detail icon={MapPin} label="City" value={profile?.city ?? ""} />
            <Detail icon={MapPin} label="State" value={profile?.state ?? ""} />
            <Detail icon={MapPin} label="Country" value={profile?.country ?? ""} />
            <Detail icon={CalendarCheck} label="Member since" value={formatDate(user.createdAt)} />
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
            {certified ? (
              <p className="text-sm text-muted">
                Certified realtor. Their listings can go live once the documents clear.
              </p>
            ) : (
              <p className="text-sm text-muted">
                This realtor is not certified yet, so their listings cannot go live.
              </p>
            )}
          </div>
        </div>
      </Reveal>

      {/* identity */}
      <Reveal y={16}>
        <Panel title="Identity">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-4">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-lg",
                identity?.verified ? "bg-verified/12 text-verified" : "bg-surface-2 text-faint",
              )}
            >
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                {identity?.verified ? "Identity verified" : "Identity not verified"}
              </p>
              <p className="text-xs text-muted">
                {identity?.verified
                  ? `${documentLabel(identity.document!)} ending ${identity.last4}, face matched against the record.`
                  : "This realtor has not completed a NIN or BVN check."}
              </p>
            </div>
          </div>

          {identity?.verified && (
            <dl className="mt-4">
              <Detail icon={User} label="Name on the record" value={identity.legalName} />
              <Detail
                icon={CalendarCheck}
                label="Verified on"
                value={identity.verifiedOn ? formatDate(identity.verifiedOn) : ""}
              />
            </dl>
          )}
        </Panel>
      </Reveal>

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

function EmptyProfile() {
  return (
    <p className="text-sm text-muted">
      This account has no profile yet. One is created the first time they open their account
      page.
    </p>
  );
}

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
              className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-ink"
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

function NotFound({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <UsersRound className="size-7" />
      </span>
      <h1 className="display mt-5 text-3xl text-ink">Realtor not found</h1>
      <p className="mt-2 max-w-sm text-muted">{message}</p>
      <Link to="/admin/realtors" className={buttonClasses("brand", "md", "mt-7")}>
        <ArrowLeft className="size-4" aria-hidden />
        Back to realtors
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-36 animate-pulse rounded bg-surface-2" />
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
      <Panel title="Professional details">
        <div className="h-48 animate-pulse rounded-xl bg-surface-2" />
      </Panel>
    </div>
  );
}
