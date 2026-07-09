import { Link } from "react-router";
import { BadgeCheck, ArrowUpRight } from "lucide-react";
import type { Realtor } from "@/types";
import { realtorMeta } from "@/lib/realtorMeta";

/**
 * The Realtors page signature — a credential card. A certified realtor presented
 * like a professional: portrait and a brand-gradient certification seal.
 */
export function CredentialCard({ realtor }: { realtor: Realtor }) {
  const meta = realtorMeta(realtor);
  const photo = `${realtor.avatar}?auto=format&fit=crop&crop=faces&w=640&h=800&q=80`;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_10px_26px_-18px_rgba(20,33,43,0.2)]">
      <div className="relative aspect-4/5 overflow-hidden rounded-t-3xl">
        <img
          src={photo}
          alt={realtor.name}
          loading="lazy"
          className="size-full object-cover object-[center_18%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a1620]/90 via-[#0a1620]/10 to-transparent" />
        <span className="bg-brand-gradient absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[#04121f] shadow-sm">
          <BadgeCheck className="size-3.5" aria-hidden /> Certified
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="display text-2xl text-white">{realtor.name}</h3>
          <p className="mt-0.5 text-sm text-white/75">
            {realtor.agency} · {realtor.city}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate text-sm text-muted">{meta.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {meta.specialties
            .filter(Boolean)
            .map((s) => (
              <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                {s}
              </span>
            ))}
        </div>

        {/* Track record — bring back once realtors have live, verifiable numbers:
        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-line">
          <Stat value={String(realtor.completedDeals)} label="Deals" />
          <Stat value={String(realtor.verifiedListings)} label="Verified" border />
          <Stat value={`’${String(meta.since).slice(2)}`} label="Since" border />
        </div>
        */}

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

/* Re-enable together with the track-record block above.
function Stat({ value, label, border }: { value: string; label: string; border?: boolean }) {
  return (
    <div className={["px-3 py-2.5 text-center", border ? "border-l border-line" : ""].join(" ")}>
      <div className="text-lg font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-[0.62rem] uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}
*/
