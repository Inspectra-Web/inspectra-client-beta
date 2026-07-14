import type { ComponentType } from "react";
import { toast } from "react-toastify";
import {
  MapPin, Phone, Mail, Pencil, Share2, BadgeCheck, ShieldCheck, Briefcase,
  Building2, Layers, MapPinned, Languages, CircleDot, MessageSquare, User, ExternalLink,
} from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonClasses } from "@/components/ui/Button";
import { realtor } from "@/data/realtor";
import { cn } from "@/lib/cn";

/** Read-only realtor profile overview (image_1). The trust-facing "who you are dealing with". */
export function AccountProfile({ onEdit }: { onEdit: () => void }) {
  const r = realtor;
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
                <span className="relative -mt-12 shrink-0">
                  <img src={r.avatar} alt={r.name} className="size-24 rounded-2xl object-cover ring-4 ring-surface" />
                  {r.certified && (
                    <span className="absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full bg-foil ring-2 ring-surface" title="Certified realtor">
                      <BadgeCheck className="size-4 text-[#3a2c0f]" aria-hidden />
                    </span>
                  )}
                </span>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="display text-2xl text-ink">{r.name}</h2>
                    {r.certified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foil/15 px-2.5 py-0.5 text-xs font-semibold text-foil">
                        <BadgeCheck className="size-3.5" aria-hidden /> Certified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {r.role} · {r.agency}
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
              <Fact icon={MapPin} text={`${r.address}, ${r.city}`} />
              <Fact icon={Phone} text={r.phone} />
              <Fact icon={Mail} text={r.email} />
              {r.socials.length > 0 && (
                <div className="ml-auto flex items-center gap-2 max-sm:ml-0">
                  {r.socials.map((s) => (
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
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* self description */}
      <Reveal y={16}>
        <Panel title="Self description">
          <p className="leading-relaxed text-muted">{r.selfDescription}</p>
        </Panel>
      </Reveal>

      {/* details */}
      <div className="space-y-6">
        <Reveal y={16}>
          <Panel title="Professional details">
            <dl>
              <Detail icon={Briefcase} label="Experience" value={r.experience} />
              <div className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5">
                <dt className="flex items-center gap-2.5 text-sm text-muted">
                  <Layers className="size-4 shrink-0 text-faint" aria-hidden />
                  Specialization
                </dt>
                <dd className="flex flex-wrap justify-end gap-1.5">
                  {r.specialization.length ? (
                    r.specialization.map((s) => (
                      <span key={s} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-ink">{s}</span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-ink">—</span>
                  )}
                </dd>
              </div>
              <Detail icon={Building2} label="Agency" value={r.agency} />
              <Detail icon={MapPinned} label="Agency address" value={r.agencyAddress} />
              <Detail icon={MapPin} label="Region" value={r.region} />
            </dl>
          </Panel>
        </Reveal>

        <Reveal y={16}>
          <Panel title="Additional details">
            <dl>
              <Detail icon={Languages} label="Languages spoken" value={r.languages} />
              <Detail icon={CircleDot} label="Availability" value={r.availabilityStatus} />
              <Detail icon={MessageSquare} label="Contact means" value={r.contactMeans} />
              <Detail icon={User} label="Gender" value={r.gender} />
              <Detail icon={MapPin} label="City" value={r.city} />
              <Detail icon={MapPin} label="State" value={r.state} />
              <Detail icon={MapPin} label="Country" value={r.country} />
            </dl>
          </Panel>
        </Reveal>
      </div>

      {/* verification */}
      <Reveal y={16}>
        <Panel title="Verification">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-ink">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{r.governmentId.label}</p>
              <p className="text-xs text-muted">
                {r.governmentId.status === "verified"
                  ? "Confirmed by our team."
                  : "Submitted, under review by our team."}
              </p>
            </div>
            <StatusBadge status={r.governmentId.status} />
          </div>
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
