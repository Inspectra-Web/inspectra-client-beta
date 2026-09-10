import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
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
  Pencil,
  Ruler,
  Tag,
  Toilet,
  Trash2,
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import {
  useDeleteListing,
  useMyListing,
  listingLocation,
  typeLabel,
  type ListingFee,
  type RealtorListing,
} from "@/lib/properties";
import { formatDate, formatPriceFull } from "@/lib/format";
import { LISTING_INTENT_LABEL, priceSuffix } from "@/lib/listing";
import { toDocCheck } from "@/lib/listing";

interface Spec {
  label: string;
  value: string;
  Icon: LucideIcon;
}

/**
 * Only the measurements this property actually has. Zero means not applicable.
 * The icon is the label: the words are kept for screen readers and on hover.
 */
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

export function RealtorListingDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const { data: listing, isPending, isError, error } = useMyListing(id);
  const remove = useDeleteListing();

  if (isPending) return <DetailSkeleton />;

  if (isError || !listing)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Building2 className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Listing not found</h1>
        <p className="mt-2 text-muted">{apiMessage(error, "This listing may have been removed.")}</p>
        <Link to="/realtor/listings" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to listings
        </Link>
      </div>
    );

  const specs = buildSpecs(listing);
  const checks = listing.documents.map(toDocCheck(listing.id));
  const verifiedDocs = checks.filter((c) => c.state === "verified").length;
  const suffix = priceSuffix(listing.listingStatus);
  const required = listing.fees.additional.filter((f) => !f.optional);
  const total = required.reduce((sum, f) => sum + f.amount, listing.price);

  async function onDelete() {
    try {
      const { message } = await remove.mutateAsync(listing!.id);
      toast.success(message ?? "Listing deleted.");
      navigate("/realtor/listings");
    } catch (err) {
      toast.error(apiMessage(err, "Could not delete this listing."));
    }
  }

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
          title={listing.title}
          subtitle={listingLocation(listing)}
          actions={
            <>
              <ListingIntentBadge listingFor={listing.listingStatus} />
              <StatusBadge status={listing.verification.status} />
            </>
          }
        />
      </Reveal>

      {/* What the reviewer said, when they said anything. */}
      {listing.verification.note && (
        <Reveal y={12}>
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-rose-500" aria-hidden />
            <div>
              <p className="font-semibold text-ink">From the verification team</p>
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
          <span className="ml-2 text-sm font-normal text-faint">{listing.ref}</span>
        </p>
      </Reveal>

      <Reveal y={16}>
        {listing.images.length ? (
          <Gallery
            images={listing.images}
            title={listing.title}
            status={listing.verification.status}
            heightClass="h-[72vh] min-h-96 max-h-152 max-sm:h-[44vh] max-sm:min-h-0"
          />
        ) : (
          <EmptyState
            icon={Images}
            title="No photos yet"
            message="Photos are what a buyer looks at first. Add them from the edit screen."
          />
        )}
      </Reveal>

      <Reveal y={16} className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        <PerfStat Icon={Eye} label="Views" value={listing.views.toLocaleString()} />
        <PerfStat Icon={FileText} label="Documents attached" value={listing.documents.length} />
        <PerfStat Icon={CalendarDays} label="Listed" value={formatDate(listing.createdAt)} />
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
                  <FeeRow key={fee.name} label={fee.name} amount={fee.amount} fee={fee} />
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
              {checks.length ? (
                <DocCheckList checks={checks} actions />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No documents attached"
                  message="Title documents are what earns this listing its Verified badge."
                />
              )}
            </Panel>
          </Reveal>
        </div>

        <Reveal y={16}>
          <div className="sticky top-24">
            <Panel title="Manage listing">
              <div className="space-y-2.5">
                <Link
                  to={`/realtor/listings/${listing.id}/edit`}
                  className={buttonClasses("brand", "md", "w-full")}
                >
                  <Pencil className="size-4" aria-hidden />
                  Edit listing
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className={buttonClasses("outline", "md", "w-full")}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete listing
                </button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted text-center">
                Editing a verified listing sends it back for verification.
              </p>
            </Panel>
          </div>
        </Reveal>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete this listing?"
        description="It is removed from your portfolio and from the marketplace. This cannot be undone."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={onDelete}
      />
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

function FeeRow({ label, amount, fee }: { label: string; amount: number; fee?: ListingFee }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <span className="text-sm text-muted">
        {label}
        {fee?.optional && <span className="ml-2 text-xs text-faint">optional</span>}
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
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
