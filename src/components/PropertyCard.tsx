import { BedDouble, Bath, Ruler, MapPin, Video, ShieldCheck } from "lucide-react";
import type { Property } from "@/types";
import { realtorById } from "@/data/mock";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

export function PropertyCard({ property }: { property: Property }) {
  const realtor = realtorById(property.realtorId);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface",
        "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      )}
    >
      {/* media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3">
          <StatusBadge status={property.status} onPhoto />
        </div>
        {property.remoteReady && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 text-[0.68rem] font-medium text-white backdrop-blur">
            <Video className="size-3" strokeWidth={2.5} aria-hidden />
            Remote-ready
          </span>
        )}

        {/* price plate */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/75 px-2.5 py-1 backdrop-blur">
          <span className="font-display text-lg font-semibold text-white">
            {formatPrice(property.price)}
          </span>
          {property.listingFor === "rent" && (
            <span className="ml-1 text-xs text-white/70">/yr</span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold leading-tight text-ink">
            {property.title}
          </h3>
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5 text-faint" aria-hidden />
            {property.location}, {property.city}
          </p>
        </div>

        {/* spec row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          {property.beds != null && (
            <Spec Icon={BedDouble} label={`${property.beds} bed`} />
          )}
          {property.baths != null && (
            <Spec Icon={Bath} label={`${property.baths} bath`} />
          )}
          {property.areaSqm != null && (
            <Spec Icon={Ruler} label={`${property.areaSqm} m²`} />
          )}
        </div>

        {/* verification + realtor */}
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5 text-verified" aria-hidden />
            {property.documents.length} documents verified
          </span>
          {realtor?.certified && (
            <span className="text-xs text-verified">Certified agent</span>
          )}
        </div>
      </div>
    </article>
  );
}

function Spec({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 text-faint" />
      {label}
    </span>
  );
}
