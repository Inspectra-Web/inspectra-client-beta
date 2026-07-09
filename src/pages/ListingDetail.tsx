import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Share2,
  MapPin,
  Home,
  BedDouble,
  Bath,
  Ruler,
  Check,
  ShieldCheck,
  CalendarCheck,
  Send,
  BadgeCheck,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Utensils,
  Milestone,
  Plane,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PropertyCard } from "@/components/PropertyCard";
import { Gallery } from "@/components/listing/Gallery";
import { VerificationDossier } from "@/components/listing/VerificationDossier";
import { properties, realtorById } from "@/data/mock";
import { buildListingDetail, type FeeLine, type NearbyLine } from "@/lib/listingDetail";
import { formatPriceFull } from "@/lib/format";
import type { Property, Realtor } from "@/types";
import { cn } from "@/lib/cn";

const NEARBY_ICONS = [ShoppingCart, GraduationCap, HeartPulse, Utensils, Milestone, Plane];

export function ListingDetail() {
  const { id } = useParams();
  const property = properties.find((p) => p.id === id);
  if (!property) return <NotFound />;

  const realtor = realtorById(property.realtorId);
  const detail = buildListingDetail(property, realtor);
  const isRent = property.listingFor === "rent";

  const sameCity = properties.filter((p) => p.id !== property.id && p.city === property.city);
  const similar = [
    ...sameCity,
    ...properties.filter((p) => p.id !== property.id && !sameCity.includes(p)),
  ].slice(0, 3);

  return (
    <div className="pb-24">
      <Container className="pt-6 max-sm:pt-4">
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-muted">
            <Link to="/listings" className="inline-flex shrink-0 items-center gap-1 hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> Listings
            </Link>
            <span className="text-faint">/</span>
            <span className="shrink-0">{property.city}</span>
            <span className="text-faint max-sm:hidden">/</span>
            <span className="truncate text-ink max-sm:hidden">{property.title}</span>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <SaveButton />
            <ShareButton />
          </div>
        </div>
      </Container>

      <Container className="mt-5">
        <Gallery images={detail.gallery} title={property.title} status={property.status} />
      </Container>

      <Container className="mt-8">
        <div className="grid grid-cols-[1fr_360px] gap-12 max-xl:gap-10 max-lg:grid-cols-1 max-lg:gap-8">
          {/* main column */}
          <div className="min-w-0">
            <header className="border-b border-line pb-7">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <StatusBadge status={property.status} />
                <span className="text-sm text-muted">Ref {property.ref}</span>
              </div>
              <h1 className="display mt-4 text-[2.6rem] leading-[1.05] text-balance text-ink max-lg:text-4xl max-sm:text-3xl">
                {property.title}
              </h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-muted">
                <MapPin className="size-4" aria-hidden /> {property.location}, {property.city}
              </p>
              <p className="mt-5 hidden text-ink max-lg:block">
                <span className="display text-3xl">{formatPriceFull(property.price)}</span>
                {isRent && <span className="text-base text-muted"> /year</span>}
              </p>
            </header>

            <dl className="grid grid-cols-4 gap-6 border-b border-line py-6 max-sm:grid-cols-2 max-sm:gap-5">
              <Fact icon={Home} label="Type" value={property.type} />
              {property.beds != null && <Fact icon={BedDouble} label="Bedrooms" value={String(property.beds)} />}
              {property.baths != null && <Fact icon={Bath} label="Bathrooms" value={String(property.baths)} />}
              {property.areaSqm != null && (
                <Fact icon={Ruler} label={property.type === "Land" ? "Plot" : "Area"} value={`${property.areaSqm} m²`} />
              )}
            </dl>

            {/* action card moves inline below the header on smaller screens */}
            <div className="hidden py-6 max-lg:block">
              <ActionCard property={property} detail={detail} realtor={realtor} />
            </div>

            <Reveal>
              <Block eyebrow="Overview" title="About this home">
                {detail.description.map((para, idx) => (
                  <p key={idx} className="mt-4 leading-relaxed text-muted first:mt-0">
                    {para}
                  </p>
                ))}
                <dl className="mt-6 grid grid-cols-2 gap-x-10 gap-y-3 border-t border-line pt-6 max-sm:grid-cols-1 max-sm:gap-y-2">
                  {detail.specs.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-4 border-b border-line/70 pb-2.5">
                      <dt className="text-sm text-muted">{s.label}</dt>
                      <dd className="text-right text-sm font-medium text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Block>
            </Reveal>

            <Reveal>
              <VerificationDossier
                status={property.status}
                checks={detail.checks}
                passed={detail.checksPassed}
                total={detail.checksTotal}
              />
            </Reveal>

            <Reveal>
              <Block eyebrow="Inside" title="Features & amenities">
                <div className="grid grid-cols-2 gap-x-10 gap-y-8 max-sm:grid-cols-1">
                  <FeatureList label="Features" items={detail.features} />
                  <FeatureList label="Amenities" items={detail.amenities} />
                </div>
              </Block>
            </Reveal>

            <Reveal>
              <Block eyebrow="The numbers" title={isRent ? "What it costs to move in" : "What you'll pay"}>
                <div className="overflow-hidden rounded-2xl border border-line">
                  {detail.fees.map((line) => (
                    <FeeRow key={line.label} line={line} />
                  ))}
                  <div className="flex items-center justify-between gap-4 bg-surface-2/60 px-5 py-4">
                    <span className="font-semibold text-ink">{detail.feesTotalLabel}</span>
                    <span className="display text-xl text-ink">{formatPriceFull(detail.feesTotal)}</span>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" aria-hidden />
                  {detail.feesNote} Every figure is verified against the listing — nothing new appears at
                  signing.
                </p>
              </Block>
            </Reveal>

            <Reveal>
              <Block eyebrow="Location" title="Where you'll be">
                <ListingMap property={property} nearby={detail.nearby} />
              </Block>
            </Reveal>

            {realtor && (
              <Reveal>
                <Block eyebrow="Listed by" title="Your realtor">
                  <RealtorPanel realtor={realtor} />
                </Block>
              </Reveal>
            )}
          </div>

          {/* sticky action card (desktop) */}
          <aside className="max-lg:hidden">
            <div className="sticky top-24">
              <ActionCard property={property} detail={detail} realtor={realtor} />
            </div>
          </aside>
        </div>
      </Container>

      <section className="mt-16 border-t border-line pt-14 max-sm:pt-10">
        <Container>
          <SectionHeading eyebrow="Keep looking" title="Similar verified homes" />
          <div className="mt-10 grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {similar.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

/* ---------- sections ---------- */

function Block({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-8 max-sm:py-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">{eyebrow}</p>
      <h2 className="display mt-2 text-2xl text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <Icon className="size-5 text-brand" aria-hidden />
      <dt className="mt-2 text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

function FeatureList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
      <ul className="mt-3.5 space-y-2.5">
        {items.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-muted">
            <Check className="size-4 shrink-0 text-verified" aria-hidden /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeeRow({ line }: { line: FeeLine }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <span className="text-sm text-muted">
        {line.label}
        {line.note && <span className="ml-2 text-xs text-faint">{line.note}</span>}
      </span>
      <span className="text-sm font-medium tabular-nums text-ink">{formatPriceFull(line.amount)}</span>
    </div>
  );
}

function ListingMap({ property, nearby }: { property: Property; nearby: NearbyLine[] }) {
  return (
    <div>
      <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-line bg-surface-2 max-sm:aspect-[3/2]">
        <svg
          aria-hidden
          viewBox="0 0 400 175"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full text-line"
        >
          <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7">
            <path d="M0 55 H400" />
            <path d="M0 120 H400" />
            <path d="M110 0 V175" />
            <path d="M270 0 V175" />
            <path d="M-20 150 L180 -10" />
            <path d="M230 185 L430 30" />
          </g>
        </svg>
        <div className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-2xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-3 rounded-full bg-brand/15" />
          <span className="relative grid size-10 place-items-center rounded-full bg-brand text-[#04121f] shadow-lg">
            <MapPin className="size-5" aria-hidden />
          </span>
        </div>
        <div className="absolute bottom-4 left-4 rounded-xl bg-surface/90 px-3.5 py-2 backdrop-blur">
          <p className="text-sm font-semibold text-ink">{property.location}</p>
          <p className="text-xs text-muted">
            {property.city} · {property.coords.lat.toFixed(3)}, {property.coords.lng.toFixed(3)}
          </p>
        </div>
      </div>
      <p className="mt-2.5 text-xs text-faint">
        Approximate area shown. The exact address is shared once you book an inspection.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-4 max-sm:grid-cols-2">
        {nearby.map((n, i) => {
          const Icon = NEARBY_ICONS[i % NEARBY_ICONS.length];
          return (
            <div key={n.label} className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{n.label}</p>
                <p className="text-xs text-muted">{n.distance}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RealtorPanel({ realtor }: { realtor: Realtor }) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 max-sm:flex-col max-sm:items-start">
      <img
        src={`${realtor.avatar}?auto=format&fit=facearea&facepad=3&w=160&h=160&q=80`}
        alt={realtor.name}
        className="size-16 rounded-full object-cover ring-1 ring-line"
      />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {realtor.name}
          {realtor.certified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-verified/12 px-2 py-0.5 text-xs font-semibold text-verified">
              <BadgeCheck className="size-3.5" aria-hidden /> Certified
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {realtor.agency} · {realtor.city}
        </p>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <span>
            <span className="font-semibold text-ink">{realtor.completedDeals}</span> deals closed
          </span>
          <span>
            <span className="font-semibold text-ink">{realtor.verifiedListings}</span> verified listings
          </span>
        </p>
      </div>
      <Link to="/realtors" className={cn(buttonClasses("outline", "md"), "shrink-0 max-sm:w-full")}>
        View profile <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function ActionCard({
  property,
  detail,
  realtor,
}: {
  property: Property;
  detail: ReturnType<typeof buildListingDetail>;
  realtor?: Realtor;
}) {
  const [requested, setRequested] = useState(false);
  const isRent = property.listingFor === "rent";
  const first = realtor?.name.split(" ")[0];
  const pct = detail.checksTotal ? Math.round((detail.checksPassed / detail.checksTotal) * 100) : 0;
  const bar =
    property.status === "verified" ? "bg-verified" : property.status === "pending" ? "bg-gold" : "bg-rose-500";

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 max-sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="display text-3xl text-ink">{formatPriceFull(property.price)}</p>
          <p className="mt-1 text-sm text-muted">{isRent ? "per year" : "for sale"}</p>
        </div>
        <StatusBadge status={property.status} />
      </div>

      <div className="mt-5 rounded-2xl bg-surface-2/60 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <ShieldCheck className="size-4 text-verified" aria-hidden /> Verification
          </span>
          <span className="font-semibold text-ink tabular-nums">
            {detail.checksPassed}/{detail.checksTotal} passed
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">Property and realtor checked before this listing went live.</p>
      </div>

      {requested ? (
        <div className="mt-5 rounded-2xl border border-verified/30 bg-verified/8 p-4 text-sm">
          <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <CalendarCheck className="size-4 text-verified" aria-hidden /> Request sent
          </p>
          <p className="mt-1 text-muted">
            {first ?? "The realtor"} will call to lock in a time. We hold your details — never your money.
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setRequested(true)}
            className={cn(buttonClasses("brand", "lg"), "mt-5 w-full")}
          >
            <CalendarCheck className="size-4" aria-hidden /> Book an inspection
          </button>
          <button
            type="button"
            onClick={() => setRequested(true)}
            className={cn(buttonClasses("outline", "lg"), "mt-2.5 w-full")}
          >
            <Send className="size-4" aria-hidden /> Message {first ?? "realtor"}
          </button>
        </>
      )}

      {realtor && (
        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <img
            src={`${realtor.avatar}?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80`}
            alt={realtor.name}
            className="size-10 rounded-full object-cover ring-1 ring-line"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-sm font-medium text-ink">
              {realtor.name}
              {realtor.certified && <BadgeCheck className="size-3.5 fill-verified text-white" aria-hidden />}
            </p>
            <p className="truncate text-xs text-muted">{realtor.agency}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small controls ---------- */

function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setSaved((v) => !v)}
      aria-pressed={saved}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ink transition-colors hover:bg-surface-2"
    >
      <Heart className={cn("size-4", saved ? "fill-rose-500 text-rose-500" : "text-muted")} aria-hidden />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const share = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ink transition-colors hover:bg-surface-2"
    >
      <Share2 className="size-4 text-muted" aria-hidden />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">Listing</p>
      <h1 className="display mt-3 text-3xl text-ink">We can't find that home</h1>
      <p className="mt-2 text-muted">
        It may have been taken down, or the link is off. Here's everything that's live right now.
      </p>
      <Link to="/listings" className={cn(buttonClasses("primary", "lg"), "mt-6")}>
        Back to listings
      </Link>
    </Container>
  );
}
