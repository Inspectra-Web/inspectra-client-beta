import { Link } from "react-router";
import { ArrowUpRight, BadgeCheck, ShieldCheck } from "lucide-react";
import type { Realtor } from "@/types";
import { buttonClasses } from "@/components/ui/Button";

/** Compact realtor card for the detail-page aside. Trust-ranked, no score shown. */
export function RealtorSummary({ realtor }: { realtor: Realtor }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
        Listed by
      </p>
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <img
            src={`${realtor.avatar}?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80`}
            alt={realtor.name}
            className="size-11 rounded-full object-cover ring-1 ring-line"
          />
          {realtor.certified && (
            <BadgeCheck
              className="absolute -bottom-0.5 -right-0.5 size-4 fill-verified text-white"
              aria-hidden
            />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{realtor.name}</p>
          <p className="truncate text-sm text-muted">{realtor.agency}</p>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
        <ShieldCheck className="size-4 text-verified" aria-hidden />
        Trust-ranked realtor, {realtor.city}
      </p>
      <Link
        to={`/realtors/${realtor.id}`}
        className={buttonClasses("outline", "sm", "mt-4 w-full")}
      >
        <ArrowUpRight className="size-4" aria-hidden />
        View profile
      </Link>
    </div>
  );
}
