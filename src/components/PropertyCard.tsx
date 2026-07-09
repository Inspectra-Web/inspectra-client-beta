import { useState } from "react";
import { Heart, BadgeCheck, BedDouble, Bath, Ruler, Video } from "lucide-react";
import type { Property } from "@/types";
import { realtorById } from "@/data/mock";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PropertyCard({ property }: { property: Property }) {
  const realtor = realtorById(property.realtorId);
  const [saved, setSaved] = useState(false);

  return (
    <article className="group flex flex-col">
      {/* media */}
      <div className="relative aspect-[10/9] overflow-hidden rounded-2xl transform-gpu">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          className="size-full object-cover object-center"
        />

        {property.status === "verified" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
            <BadgeCheck className="size-3.5 text-emerald-600" strokeWidth={2.5} aria-hidden />
            Verified
          </span>
        )}

        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save property"}
          className="absolute right-3 top-3 transition-transform hover:scale-110"
        >
          <Heart
            className={cn(
              "size-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
              saved ? "fill-rose-500 text-rose-500" : "fill-black/25 text-white",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {property.hasVideo && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <Video className="size-3.5" aria-hidden />
            Video
          </span>
        )}

        {/* carousel dots (decorative) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full shadow-sm",
                i === 0 ? "bg-white" : "bg-white/55",
              )}
            />
          ))}
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-ink">{property.title}</h3>
          {realtor && (
            <span
              className="relative shrink-0"
              title={`Listed by ${realtor.name}${realtor.certified ? " · Certified" : ""}`}
            >
              <img
                src={`${realtor.avatar}?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80`}
                alt={realtor.name}
                loading="lazy"
                className="size-8 rounded-full object-cover ring-1 ring-line"
              />
              {realtor.certified && (
                <BadgeCheck
                  className="absolute -bottom-0.5 -right-0.5 size-4 fill-verified text-white drop-shadow-sm"
                  aria-hidden
                />
              )}
            </span>
          )}
        </div>

        <p className="mt-0.5 line-clamp-1 text-sm text-muted">
          {property.location}, {property.city}
        </p>

        {/* feature icons */}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted">
          {property.beds != null && <Feature Icon={BedDouble} label={`${property.beds}`} />}
          {property.baths != null && <Feature Icon={Bath} label={`${property.baths}`} />}
          {property.areaSqm != null && (
            <Feature Icon={Ruler} label={`${property.areaSqm} m²`} />
          )}
        </div>

        <p className="mt-2 font-semibold text-ink">
          {formatPriceFull(property.price)}
          {property.listingFor === "rent" && (
            <span className="font-normal text-muted"> /yr</span>
          )}
        </p>
      </div>
    </article>
  );
}

function Feature({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4 text-faint" />
      {label}
    </span>
  );
}
