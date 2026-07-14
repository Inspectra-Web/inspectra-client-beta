import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  Inbox,
  CalendarCheck,
  Percent,
  Pencil,
  Share2,
  MapPin,
  ChevronRight,
  MessageSquare,
  Check,
  ShieldCheck,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Utensils,
  Milestone,
  Plane,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { DocCheckList } from "@/components/realtor/DocCheckList";
import { Gallery } from "@/components/listing/Gallery";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { myListingStat, leads, realtorInspections } from "@/data/realtor";
import { propertyById } from "@/data/mock";
import { buildListingDetail, type FeeLine, type NearbyLine } from "@/lib/listingDetail";
import { formatPriceFull } from "@/lib/format";
import { priceSuffix, priceCadence, deriveDocChecks } from "@/lib/listing";
import type { Property } from "@/types";

const NEARBY_ICONS = [ShoppingCart, GraduationCap, HeartPulse, Utensils, Milestone, Plane];

export function RealtorListingDetail() {
  const { id } = useParams();
  const stat = id ? myListingStat(id) : undefined;
  const property = id ? propertyById(id) : undefined;

  if (!stat || !property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Building2 className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Listing not found</h1>
        <p className="mt-2 text-muted">This listing may have been removed.</p>
        <Link to="/realtor/listings" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to listings
        </Link>
      </div>
    );
  }

  const detail = buildListingDetail(property);
  const checks = deriveDocChecks(property);
  const verifiedDocs = checks.filter((c) => c.state === "verified").length;
  const listingLeads = leads.filter((l) => l.propertyId === property.id);
  const listingInspections = realtorInspections
    .filter((i) => i.propertyId === property.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const leadRate = stat.views ? ((stat.leads / stat.views) * 100).toFixed(1) : "0";
  const suffix = priceSuffix(property.listingFor);

  return (
    <div className="space-y-6">
      <Link
        to="/realtor/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to listings
      </Link>

      <Reveal>
        <PageHeader
          title={property.title}
          subtitle={`${property.location}, ${property.city} · Ref ${property.ref}`}
          actions={
            <>
              <ListingIntentBadge listingFor={property.listingFor} />
              <StatusBadge status={property.status} />
            </>
          }
        />
      </Reveal>

      {/* price line */}
      <Reveal y={12}>
        <p className="text-2xl font-semibold text-ink">
          {formatPriceFull(property.price)}
          {suffix && <span className="text-base font-normal text-muted"> {suffix}</span>}
          <span className="ml-2 text-sm font-normal text-faint">({priceCadence(property.listingFor)})</span>
        </p>
      </Reveal>

      {/* gallery */}
      <Reveal y={16}>
        <Gallery
          images={detail.gallery}
          title={property.title}
          status={property.status}
          heightClass="h-[48vh] min-h-72 max-h-[30rem] max-sm:h-[38vh] max-sm:min-h-0"
        />
      </Reveal>

      {/* performance */}
      <Reveal y={16} className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <PerfStat Icon={Eye} label="Views" value={stat.views.toLocaleString()} />
        <PerfStat Icon={Inbox} label="Leads" value={stat.leads} />
        <PerfStat Icon={CalendarCheck} label="Inspections" value={listingInspections.length} />
        <PerfStat Icon={Percent} label="Lead rate" value={`${leadRate}%`} />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="space-y-6">
          {/* overview */}
          <Reveal y={16}>
            <Panel title="About this home">
              {detail.description.map((para, i) => (
                <p key={i} className="mt-4 leading-relaxed text-muted first:mt-0">
                  {para}
                </p>
              ))}
              <dl className="mt-6 grid grid-cols-2 gap-x-10 gap-y-3 border-t border-line pt-6 max-sm:grid-cols-1 max-sm:gap-y-2">
                {detail.specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between gap-4 border-b border-line/70 pb-2.5"
                  >
                    <dt className="text-sm text-muted">{s.label}</dt>
                    <dd className="text-right text-sm font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Reveal>

          {/* features & amenities */}
          <Reveal y={16}>
            <Panel title="Features & amenities">
              <div className="grid grid-cols-2 gap-x-10 gap-y-8 max-sm:grid-cols-1">
                <FeatureList label="Features" items={detail.features} />
                <FeatureList label="Amenities" items={detail.amenities} />
              </div>
            </Panel>
          </Reveal>

          {/* price breakdown */}
          <Reveal y={16}>
            <Panel
              title={
                property.listingFor === "shortlet"
                  ? "What a stay costs"
                  : property.listingFor === "sale"
                    ? "What a buyer pays"
                    : "What a tenant pays"
              }
            >
              <div className="overflow-hidden rounded-2xl border border-line">
                {detail.fees.map((line) => (
                  <FeeRow key={line.label} line={line} />
                ))}
                <div className="flex items-center justify-between gap-4 bg-surface-2/60 px-5 py-4">
                  <span className="font-semibold text-ink">{detail.feesTotalLabel}</span>
                  <span className="display text-xl text-ink">
                    {formatPriceFull(detail.feesTotal)}
                  </span>
                </div>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" aria-hidden />
                {detail.feesNote}
              </p>
            </Panel>
          </Reveal>

          {/* location */}
          <Reveal y={16}>
            <Panel title="Location">
              <ListingMap property={property} nearby={detail.nearby} />
            </Panel>
          </Reveal>

          {/* documents */}
          <Reveal y={16}>
            <Panel
              title={
                <span className="flex items-center gap-2.5">
                  Documents
                  <span className="text-sm font-normal text-muted">
                    {verifiedDocs} of {checks.length} verified
                  </span>
                </span>
              }
              action={
                <Link
                  to="/realtor/verification"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
                >
                  Verification
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            >
              <DocCheckList checks={checks} actions />
            </Panel>
          </Reveal>

          {/* leads on this listing */}
          <Reveal y={16}>
            <Panel
              title="Leads on this listing"
              action={
                listingLeads.length > 0 ? (
                  <Link to="/realtor/leads" className="text-sm font-medium text-brand-ink hover:underline">
                    View all
                  </Link>
                ) : undefined
              }
            >
              {listingLeads.length ? (
                <ul className="space-y-2.5">
                  {listingLeads.map((lead) => (
                    <li key={lead.id}>
                      <Link
                        to={`/realtor/leads/${lead.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
                      >
                        <img
                          src={lead.buyerAvatar}
                          alt=""
                          className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{lead.buyerName}</p>
                          <p className="truncate text-xs text-muted">{lead.message}</p>
                        </div>
                        <StatusPill status={lead.status} />
                        <ChevronRight className="size-4 shrink-0 text-faint transition-colors group-hover:text-brand-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No leads yet"
                  message="Buyer inquiries on this listing will show up here."
                />
              )}
            </Panel>
          </Reveal>

          {/* inspections on this listing */}
          <Reveal y={16}>
            <Panel
              title="Inspections on this listing"
              action={
                listingInspections.length > 0 ? (
                  <Link
                    to="/realtor/inspections"
                    className="text-sm font-medium text-brand-ink hover:underline"
                  >
                    View all
                  </Link>
                ) : undefined
              }
            >
              {listingInspections.length ? (
                <ul className="space-y-2.5">
                  {listingInspections.map((ins) => (
                    <li key={ins.id}>
                      <Link
                        to={`/realtor/inspections/${ins.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
                      >
                        <DateBlock date={ins.date} className="size-12" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">
                            {ins.time} · {ins.buyerName}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {ins.mode === "virtual" ? "Virtual tour" : "In-person visit"}
                          </p>
                        </div>
                        <StatusPill status={ins.status} />
                        <ChevronRight className="size-4 shrink-0 text-faint transition-colors group-hover:text-brand-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={CalendarCheck}
                  title="No inspections yet"
                  message="Viewings buyers book on this listing will show up here."
                />
              )}
            </Panel>
          </Reveal>
        </div>

        {/* aside */}
        <Reveal y={16}>
          <div className="sticky top-24">
            <Panel title="Manage listing">
              <div className="space-y-2.5">
                <Link
                  to={`/realtor/listings/${property.id}/edit`}
                  className={buttonClasses("brand", "md", "w-full")}
                >
                  <Pencil className="size-4" aria-hidden />
                  Edit listing
                </Link>
                <Link
                  to={`/listings/${property.id}`}
                  className={buttonClasses("outline", "md", "w-full")}
                >
                  <Eye className="size-4" aria-hidden />
                  Preview public page
                </Link>
                <button
                  type="button"
                  onClick={() => toast.success("Share link copied")}
                  className={buttonClasses("ghost", "md", "w-full")}
                >
                  <Share2 className="size-4" aria-hidden />
                  Share
                </button>
              </div>
            </Panel>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PerfStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof Eye;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand-ink">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
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
      <span className="text-sm font-medium tabular-nums text-ink">
        {formatPriceFull(line.amount)}
      </span>
    </div>
  );
}

function ListingMap({ property, nearby }: { property: Property; nearby: NearbyLine[] }) {
  return (
    <div>
      <div className="relative aspect-16/7 overflow-hidden rounded-2xl border border-line bg-surface-2 max-sm:aspect-3/2">
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
