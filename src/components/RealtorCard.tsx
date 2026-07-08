import { BadgeCheck, Star, MapPin } from "lucide-react";
import type { Realtor } from "@/types";

export function RealtorCard({ realtor }: { realtor: Realtor }) {
  return (
    <article className="flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={realtor.avatar}
          alt={realtor.name}
          className="size-20 rounded-full object-cover ring-2 ring-surface"
        />
        {realtor.certified && (
          <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-surface">
            <BadgeCheck className="size-6 text-verified" aria-hidden />
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold text-ink">
        {realtor.name}
      </h3>
      <p className="text-sm text-muted">{realtor.agency}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-faint">
        <MapPin className="size-3.5" aria-hidden />
        {realtor.city}
      </p>

      <div className="mt-5 flex w-full items-center justify-center gap-6 border-t border-line pt-4">
        <div>
          <div className="flex items-center justify-center gap-1 font-display text-lg font-bold text-ink">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            {realtor.trustScore}
          </div>
          <div className="text-[0.68rem] uppercase tracking-wide text-faint">
            Trust score
          </div>
        </div>
        <div>
          <div className="font-display text-lg font-bold text-ink">
            {realtor.completedDeals}
          </div>
          <div className="text-[0.68rem] uppercase tracking-wide text-faint">
            Deals closed
          </div>
        </div>
      </div>
    </article>
  );
}
