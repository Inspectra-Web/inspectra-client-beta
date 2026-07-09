import { Link } from "react-router";
import { BadgeCheck, ArrowUpRight } from "lucide-react";
import type { Realtor } from "@/types";

export function RealtorCard({ realtor }: { realtor: Realtor }) {
  const photo = `${realtor.avatar}?auto=format&fit=crop&crop=faces&w=640&h=800&q=80`;

  return (
    <article className="group isolate w-full overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)] max-sm:mx-auto max-sm:max-w-sm">
      {/* headshot */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
        <img
          src={photo}
          alt={realtor.name}
          loading="lazy"
          className="size-full object-cover object-[center_20%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
        {realtor.certified && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
            <BadgeCheck className="size-3.5 text-emerald-600" aria-hidden />
            Certified
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="display text-2xl text-white">{realtor.name}</h3>
          <p className="text-sm text-white/75">
            {realtor.agency} · {realtor.city}
          </p>
        </div>
      </div>

      {/* stats + cta */}
      <div className="p-5">
        <div className="flex items-center justify-around text-center">
          <Stat value={realtor.completedDeals} label="Deals closed" />
          <span className="h-9 w-px bg-line" aria-hidden />
          <Stat value={realtor.verifiedListings} label="Verified" />
        </div>
        <Link
          to="/realtors"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          View profile
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold text-ink">{value}</div>
      <div className="mt-0.5 text-[0.68rem] uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}
