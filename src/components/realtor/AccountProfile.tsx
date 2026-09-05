import type { ComponentType } from "react";
import { toast } from "react-toastify";
import {
  MapPin, Phone, Mail, Pencil, Share2, BadgeCheck, ShieldCheck, Briefcase,
  Building2, Layers, MapPinned, Languages, CircleDot, MessageSquare, User, ExternalLink,
} from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";
import { useAuthUser } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { useIdentity } from "@/lib/identity";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

const SOCIAL_LABELS: { key: "instagram" | "linkedin" | "facebook" | "x"; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
];

/** Read-only realtor profile overview. The trust-facing "who you are dealing with". */
export function AccountProfile({ onEdit }: { onEdit: () => void }) {
  const user = useAuthUser();
  const { data: profile, isPending } = useProfile();
  const { data: identity } = useIdentity();

  if (isPending || !profile)
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-2" />
        <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface-2" />
      </div>
    );

  const name = displayName(user.fullname);
  const socials = SOCIAL_LABELS.filter((s) => profile.socials?.[s.key]);
  const location = [profile.address, profile.city].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      {/* hero */}
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="relative h-28 bg-linear-to-r from-brand/25 via-brand/10 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(26,172,240,0.25),transparent_60%)]" />
          </div>
          <div className="px-7 pb-7 max-sm:px-5">
            <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
              <div className="flex items-end gap-4 max-sm:items-center">
                <span className="relative -mt-16 shrink-0 max-sm:-mt-14">
                  <UserAvatar
                    name={name}
                    avatar={user.avatar}
                    className="size-32 rounded-2xl text-3xl ring-4 ring-surface max-sm:size-28"
                  />
                  {profile.certified && (
                    <span className="absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full bg-foil ring-2 ring-surface" title="Certified realtor">
                      <BadgeCheck className="size-4 text-[#3a2c0f]" aria-hidden />
                    </span>
                  )}
                </span>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="display text-2xl text-ink">{name}</h2>
                    {/* On the name, never on the picture: the picture is not what was verified. */}
                    {identity?.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-verified/12 px-2.5 py-0.5 text-xs font-semibold text-verified">
                        <ShieldCheck className="size-3.5" aria-hidden /> Identity verified
                      </span>
                    )}
                    {profile.certified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foil/15 px-2.5 py-0.5 text-xs font-semibold text-foil">
                        <BadgeCheck className="size-3.5" aria-hidden /> Certified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {[profile.jobTitle, profile.agencyName].filter(Boolean).join(" · ") ||
                      "Add your job title and agency"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 max-sm:w-full">
                <button onClick={onEdit} className={cn(buttonClasses("brand", "md"), "max-sm:flex-1")}>
                  <Pencil className="size-4" aria-hidden /> Edit profile
                </button>
                <button onClick={() => toast.success("Profile link copied")} className={cn(buttonClasses("outline", "md"), "max-sm:flex-1")}>
                  <Share2 className="size-4" aria-hidden /> Share
                </button>
              </div>
            </div>

            {/* quick facts */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-sm">
              {location && <Fact icon={MapPin} text={location} />}
              {user.phone && <Fact icon={Phone} text={user.phone} />}
              <Fact icon={Mail} text={user.email} />
              {socials.length > 0 && (
                <div className="ml-auto flex items-center gap-2 max-sm:ml-0">
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={profile.socials[s.key]}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand/40 hover:text-brand-ink"
                    >
                      {s.label}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* self description */}
      <Reveal y={16}>
        <Panel title="Self description">
          <p className="whitespace-pre-line leading-relaxed text-muted">
            {profile.bio || "Tell buyers what you specialize in and how you work."}
          </p>
        </Panel>
      </Reveal>

      {/* details */}
      <div className="space-y-6">
        <Reveal y={16}>
          <Panel title="Professional details">
            <dl>
              <Detail icon={Briefcase} label="Experience" value={profile.experience} />
              <div className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5">
                <dt className="flex items-center gap-2.5 text-sm text-muted">
                  <Layers className="size-4 shrink-0 text-faint" aria-hidden />
                  Specialization
                </dt>
                <dd className="flex flex-wrap justify-end gap-1.5">
                  {profile.specialization.length ? (
                    profile.specialization.map((s) => (
                      <span key={s} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-ink">{s}</span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-ink">&mdash;</span>
                  )}
                </dd>
              </div>
              <Detail icon={Building2} label="Agency" value={profile.agencyName} />
              <Detail icon={MapPinned} label="Agency address" value={profile.agencyAddress} />
              <Detail icon={MapPin} label="Region" value={profile.region} />
            </dl>
          </Panel>
        </Reveal>

        <Reveal y={16}>
          <Panel title="Additional details">
            <dl>
              <Detail icon={Languages} label="Languages spoken" value={profile.language} />
              <Detail icon={CircleDot} label="Availability" value={profile.availabilityStatus} />
              <Detail icon={MessageSquare} label="Contact means" value={profile.contactMeans} />
              <Detail icon={User} label="Gender" value={profile.gender ?? ""} />
              <Detail icon={MapPin} label="City" value={profile.city} />
              <Detail icon={MapPin} label="State" value={profile.state} />
              <Detail icon={MapPin} label="Country" value={profile.country} />
            </dl>
          </Panel>
        </Reveal>
      </div>

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
  icon: Icon, label, value,
}: {
  icon: ComponentType<{ className?: string }>; label: string; value: string;
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
