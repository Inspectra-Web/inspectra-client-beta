import { Link } from "react-router";
import { BadgeCheck, ArrowUpRight } from "lucide-react";
import { realtorTagline, type PublicRealtor } from "@/lib/realtors";
import { displayName, initials } from "@/lib/format";

/**
 * The Realtors page signature: a credential card. A verified realtor presented like a
 * professional, portrait first, with the check they cleared shown as a seal.
 *
 * A realtor reaches this page by being certified or by passing the identity check,
 * so the seal names which one rather than claiming certification for both.
 */
export function CredentialCard({ realtor }: { realtor: PublicRealtor }) {
  const name = displayName(realtor.fullname);
  const place = [realtor.agencyName, realtor.city].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_10px_26px_-18px_rgba(20,33,43,0.2)]">
      <div className="relative aspect-4/5 overflow-hidden rounded-t-3xl">
        {realtor.avatar ? (
          <img
            src={realtor.avatar}
            alt={name}
            loading="lazy"
            className="size-full object-cover object-[center_18%]"
          />
        ) : (
          <div className="grid size-full place-items-center bg-surface-2">
            <span className="display text-6xl text-faint" aria-hidden>
              {initials(name)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a1620]/90 via-[#0a1620]/10 to-transparent" />

        {realtor.certified ? (
          <span className="bg-brand-gradient absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[#04121f] shadow-sm">
            <BadgeCheck className="size-3.5" aria-hidden /> Certified
          </span>
        ) : (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-verified px-2.5 py-1 text-xs font-semibold text-[#04121f] shadow-sm">
            <BadgeCheck className="size-3.5" aria-hidden /> Verified
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="display text-2xl text-white">{name}</h3>
          {place && <p className="mt-0.5 text-sm text-white/75">{place}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate text-sm text-muted">{realtorTagline(realtor)}</p>

        {realtor.specialization.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {realtor.specialization.filter(Boolean).map((s) => (
              <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-5">
          <Link
            to={`/realtors/${realtor.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand/40 hover:bg-surface-2"
          >
            View profile
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
