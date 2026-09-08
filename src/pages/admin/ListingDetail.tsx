import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  Check,
  CookingPot,
  Eye,
  FileText,
  Hammer,
  House,
  Images,
  LandPlot,
  Layers,
  MapPin,
  Ruler,
  ShieldCheck,
  Tag,
  Toilet,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DocCheckList } from "@/components/realtor/DocCheckList";
import { Gallery } from "@/components/listing/Gallery";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useAdminListing } from "@/lib/adminListings";
import { listingLocation, typeLabel, type RealtorListing } from "@/lib/properties";
import { displayName, formatDate, formatPriceFull } from "@/lib/format";
import { LISTING_INTENT_LABEL, priceCadence, priceSuffix } from "@/lib/listing";
import type { DocCheck } from "@/lib/listing";

/** The API's per-document status in the checklist's vocabulary. */
const asCheck = (name: string, status: string): DocCheck => ({
  label: name,
  state: status === "pending" ? "in-review" : (status as DocCheck["state"]),
});

interface Spec {
  label: string;
  value: string;
  Icon: LucideIcon;
}

/** Only the measurements this property actually has. Zero means not applicable. */
function buildSpecs(listing: RealtorListing): Spec[] {
  const f = listing.features;
  const spec = (label: string, Icon: LucideIcon, value: string | number): Spec[] =>
    value ? [{ label, value: String(value), Icon }] : [];

  return [
    ...spec("Type", House, typeLabel(listing.type)),
    ...spec("Category", Layers, typeLabel(listing.category)),
    ...spec("Offer", Tag, LISTING_INTENT_LABEL[listing.listingStatus]),
    ...spec("State", MapPin, listing.address.state),
    ...spec("Bedrooms", BedDouble, f.bedrooms),
    ...spec("Bathrooms", Bath, f.bathrooms),
    ...spec("Toilets", Toilet, f.toilets),
    ...spec("Parking", Car, f.garage),
    ...spec("Kitchens", CookingPot, f.kitchen),
    ...spec("Floors", Building2, f.floors),
    ...spec("Floor area", Ruler, f.floorArea && `${f.floorArea} sqm`),
    ...spec("Land size", LandPlot, f.landSize && `${f.landSize} sqm`),
    ...spec("Year built", Hammer, f.yearBuilt),
  ];
}

export function AdminListingDetail() {
  const { id = "" } = useParams();
  const { data, isPending, isError, error } = useAdminListing(id);

  if (isPending) return <DetailSkeleton />;

  if (isError || !data)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Building2 className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Listing not found</h1>
        <p className="mt-2 text-muted">{apiMessage(error, "This listing may have been removed.")}</p>
        <Link to="/admin/listings" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to listings
        </Link>
      </div>
    );

  const { listing, realtor } = data;
  const specs = buildSpecs(listing);
  const checks = listing.documents.map((d) => asCheck(d.name, d.status));
  const verifiedDocs = checks.filter((c) => c.state === "verified").length;
  const suffix = priceSuffix(listing.listingStatus);
  const required = listing.fees.additional.filter((f) => !f.optional);
  const total = required.reduce((sum, f) => sum + f.amount, listing.price);

  return (
    <div className="space-y-6">
      <Link
        to="/admin/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to listings
      </Link>

      <Reveal>
        <PageHeader
          title={listing.title}
          subtitle={`${listingLocation(listing)} · ${listing.ref}`}
          actions={
            <>
              <ListingIntentBadge listingFor={listing.listingStatus} />
              <StatusBadge status={listing.verification.status} />
            </>
          }
        />
      </Reveal>

      {listing.verification.note && (
        <Reveal y={12}>
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-rose-500" aria-hidden />
            <div>
              <p className="font-semibold text-ink">Reviewer's note</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {listing.verification.note}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal y={12}>
        <p className="text-2xl font-semibold text-ink">
          {formatPriceFull(listing.price)}
          {suffix && <span className="text-base font-normal text-muted"> {suffix}</span>}
          <span className="ml-2 text-sm font-normal text-faint">
            ({priceCadence(listing.listingStatus)})
          </span>
        </p>
      </Reveal>

      <Reveal y={16}>
        {listing.images.length ? (
          <Gallery
            images={listing.images}
            title={listing.title}
            status={listing.verification.status}
            heightClass="h-[64vh] min-h-96 max-h-152 max-sm:h-[44vh] max-sm:min-h-0"
          />
        ) : (
          <EmptyState
            icon={Images}
            title="No photos"
            message="This listing has no photography yet."
          />
        )}
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="space-y-6">
          <Reveal y={16}>
            <Panel title="About this home">
              {listing.description.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="mt-4 leading-relaxed text-muted first:mt-0">
                  {para}
                </p>
              ))}
              <dl className="mt-6 grid grid-cols-4 gap-3 border-t border-line pt-6 max-lg:grid-cols-3 max-sm:grid-cols-2">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    title={s.label}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/40 px-3.5 py-3"
                  >
                    <dt className="flex shrink-0 items-center text-brand-ink">
                      <s.Icon className="size-4" strokeWidth={2} aria-hidden />
                      <span className="sr-only">{s.label}</span>
                    </dt>
                    <dd className="truncate text-sm font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Reveal>

          {listing.amenities.length > 0 && (
            <Reveal y={16}>
              <Panel title="Amenities">
                <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 max-sm:grid-cols-1">
                  {listing.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2.5 text-muted">
                      <Check className="size-4 shrink-0 text-verified" aria-hidden /> {a}
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          )}

          <Reveal y={16}>
            <Panel
              title={
                listing.listingStatus === "shortlet"
                  ? "What a stay costs"
                  : listing.listingStatus === "sale"
                    ? "What a buyer pays"
                    : "What a tenant pays"
              }
            >
              <div className="overflow-hidden rounded-2xl border border-line">
                <FeeRow label="Asking price" amount={listing.price} />
                {listing.fees.additional.map((fee) => (
                  <FeeRow
                    key={fee.name}
                    label={fee.name}
                    amount={fee.amount}
                    optional={fee.optional}
                  />
                ))}
                <div className="flex items-center justify-between gap-4 bg-surface-2/60 px-5 py-4">
                  <span className="font-semibold text-ink">Total payable</span>
                  <span className="display text-xl text-ink">{formatPriceFull(total)}</span>
                </div>
              </div>

              {(listing.fees.paymentTerms || listing.fees.refundPolicy) && (
                <dl className="mt-4 space-y-3">
                  {listing.fees.paymentTerms && (
                    <Term label="Payment terms" value={listing.fees.paymentTerms} />
                  )}
                  {listing.fees.refundPolicy && (
                    <Term label="Refund policy" value={listing.fees.refundPolicy} />
                  )}
                </dl>
              )}

              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" aria-hidden />
                Optional fees are excluded from the total. This is what the realtor has
                published to buyers.
              </p>
            </Panel>
          </Reveal>

          <Reveal y={16}>
            <Panel
              title={
                <span className="flex items-center gap-2.5">
                  Documents
                  {checks.length > 0 && (
                    <span className="text-sm font-normal text-muted">
                      {verifiedDocs} of {checks.length} verified
                    </span>
                  )}
                </span>
              }
            >
              {checks.length ? (
                <DocCheckList checks={checks} />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No documents submitted"
                  message="Nothing to review yet: the realtor has not attached any title documents."
                />
              )}
            </Panel>
          </Reveal>
        </div>

        <Reveal y={16}>
          <div className="sticky top-24 space-y-6">
            <Panel title="Listing record">
              <dl className="space-y-3">
                <Record Icon={Eye} label="Views" value={listing.views.toLocaleString()} />
                <Record
                  Icon={FileText}
                  label="Documents"
                  value={`${listing.documents.length} attached`}
                />
                <Record Icon={Images} label="Photos" value={`${listing.images.length}`} />
                <Record
                  Icon={CalendarDays}
                  label="Listed"
                  value={formatDate(listing.createdAt)}
                />
                <Record
                  Icon={CalendarDays}
                  label="Last edited"
                  value={formatDate(listing.updatedAt)}
                />
                {listing.verification.reviewedAt && (
                  <Record
                    Icon={BadgeCheck}
                    label="Reviewed"
                    value={formatDate(listing.verification.reviewedAt)}
                  />
                )}
              </dl>
            </Panel>

            {realtor && (
              <Panel title="Listed by">
                <Link
                  to={`/admin/realtors/${realtor.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
                >
                  <UserAvatar
                    name={displayName(realtor.fullname)}
                    avatar={realtor.avatar}
                    className="size-11"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {displayName(realtor.fullname)}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {realtor.agencyName || realtor.email}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-faint transition-colors group-hover:text-brand-ink" />
                </Link>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Standing on={realtor.certified} label="Certified" />
                  <Standing on={realtor.identityVerified} label="Identity verified" />
                  <Standing
                    on={realtor.status === "active"}
                    label={realtor.status === "active" ? "Active" : "Suspended"}
                  />
                </div>
              </Panel>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Record({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-sm text-muted">
        <Icon className="size-4 shrink-0 text-faint" aria-hidden />
        {label}
      </dt>
      <dd className="text-right text-sm font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}

/** A yes/no fact about the realtor, stated plainly either way. */
function Standing({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={
        on
          ? "inline-flex items-center gap-1.5 rounded-full bg-verified/12 px-2.5 py-1 text-xs font-semibold text-verified"
          : "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted"
      }
    >
      {on ? (
        <BadgeCheck className="size-3.5" aria-hidden />
      ) : (
        <TriangleAlert className="size-3.5" aria-hidden />
      )}
      {on ? label : `Not ${label.toLowerCase()}`}
    </span>
  );
}

function FeeRow({
  label,
  amount,
  optional,
}: {
  label: string;
  amount: number;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <span className="text-sm text-muted">
        {label}
        {optional && <span className="ml-2 text-xs text-faint">optional</span>}
      </span>
      <span className="text-sm font-medium tabular-nums text-ink">{formatPriceFull(amount)}</span>
    </div>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 max-sm:flex-col max-sm:gap-1">
      <dt className="w-32 shrink-0 text-sm text-faint">{label}</dt>
      <dd className="text-sm leading-relaxed text-muted">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
      <div className="space-y-3">
        <div className="h-8 w-96 max-w-full animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="h-[44vh] min-h-64 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid grid-cols-[1fr_20rem] gap-6 max-lg:grid-cols-1">
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
