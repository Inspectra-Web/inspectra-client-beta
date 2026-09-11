import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { toast } from "react-toastify";
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
  BadgeCheck,
  Building2,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PropertyCard } from "@/components/PropertyCard";
import { Gallery } from "@/components/listing/Gallery";
import { VerificationDossier } from "@/components/listing/VerificationDossier";
import { VideoTour } from "@/components/listing/VideoTour";
import { apiMessage } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useCreateInquiry } from "@/lib/inquiries";
import { displayName, formatDate, formatPriceFull, initials } from "@/lib/format";
import { priceSuffix, readTour, toPublicDocCheck } from "@/lib/listing";
import { typeLabel, type ListingFee } from "@/lib/properties";
import {
  usePublicListing,
  usePublicListings,
  toCardListing,
  EMPTY_QUERY,
  type PublicListingDetail,
  type ListingRealtorProfile,
} from "@/lib/marketplace";
import { cn } from "@/lib/cn";

export function ListingDetail() {
  const { slug } = useParams();
  const { data, isPending, isError, error } = usePublicListing(slug ?? "");

  if (isPending) return <DetailSkeleton />;
  if (isError)
    return <NotFound message={apiMessage(error, "It may have been taken down, or the link is off.")} />;

  const { listing, realtor } = data;
  const priceTag = priceSuffix(listing.listingStatus);
  const checks = listing.documents.map(toPublicDocCheck);
  const verified = checks.filter((c) => c.state === "verified").length;
  const specs = buildSpecs(listing);
  const tour = readTour(listing.videoUrl, listing.video);
  const { bedrooms, bathrooms, floorArea, landSize } = listing.features;
  const area = floorArea || landSize;

  return (
    <div className="pb-24">
      <Container className="pt-6 max-sm:pt-4">
        <div className="flex items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 text-sm text-muted"
          >
            <Link
              to="/listings"
              className="inline-flex shrink-0 items-center gap-1 hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden /> Listings
            </Link>
            <span className="text-faint">/</span>
            <span className="shrink-0">{listing.address.city}</span>
            <span className="text-faint max-sm:hidden">/</span>
            <span className="truncate text-ink max-sm:hidden">{listing.title}</span>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <SaveButton />
            <ShareButton />
          </div>
        </div>
      </Container>

      {listing.images.length > 0 && (
        <Container className="mt-5">
          <Gallery images={listing.images} title={listing.title} status={listing.status} />
        </Container>
      )}

      <Container className="mt-8">
        <div className="grid grid-cols-[1fr_360px] gap-12 max-xl:gap-10 max-lg:grid-cols-1 max-lg:gap-8">
          {/* main column */}
          <div className="min-w-0">
            <header className="border-b border-line pb-7">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <ListingIntentBadge listingFor={listing.listingStatus} />
                <StatusBadge status={listing.status} />
                <span className="text-sm text-muted">{listing.ref}</span>
              </div>
              <h1 className="display mt-4 text-[2.6rem] leading-[1.05] text-balance text-ink max-lg:text-4xl max-sm:text-3xl">
                {listing.title}
              </h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-muted">
                <MapPin className="size-4" aria-hidden /> {listing.address.fullAddress},{" "}
                {listing.address.city}
              </p>
              <p className="mt-5 hidden text-ink max-lg:block">
                <span className="display text-3xl">{formatPriceFull(listing.price)}</span>
                {priceTag && <span className="text-base text-muted"> {priceTag}</span>}
              </p>
            </header>

            {/* Zero means "not applicable" on the API, so a fact only appears when set. */}
            <dl className="grid grid-cols-4 gap-6 border-b border-line py-6 max-sm:grid-cols-2 max-sm:gap-5">
              <Fact icon={Home} label="Type" value={typeLabel(listing.type)} />
              {bedrooms > 0 && (
                <Fact icon={BedDouble} label="Bedrooms" value={String(bedrooms)} />
              )}
              {bathrooms > 0 && (
                <Fact icon={Bath} label="Bathrooms" value={String(bathrooms)} />
              )}
              {area > 0 && (
                <Fact
                  icon={Ruler}
                  label={floorArea > 0 ? "Area" : "Plot"}
                  value={`${area} m²`}
                />
              )}
            </dl>

            {/* action card moves inline below the header on smaller screens */}
            <div className="hidden py-6 max-lg:block">
              <ActionCard
                listing={listing}
                realtor={realtor}
                verified={verified}
                total={checks.length}
              />
            </div>

            <Reveal>
              <Block eyebrow="Overview" title="About this home">
                {listing.description.split(/\n{2,}/).map((para, idx) => (
                  <p key={idx} className="mt-4 leading-relaxed text-muted first:mt-0">
                    {para}
                  </p>
                ))}
                {specs.length > 0 && (
                  <dl className="mt-6 grid grid-cols-2 gap-x-10 gap-y-3 border-t border-line pt-6 max-sm:grid-cols-1 max-sm:gap-y-2">
                    {specs.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between gap-4 border-b border-line/70 pb-2.5"
                      >
                        <dt className="text-sm text-muted">{s.label}</dt>
                        <dd className="text-right text-sm font-medium text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Block>
            </Reveal>

            {/* With the photos, not after the paperwork: it is part of seeing the place.
                The section is gated on the tour, not just the player, or a listing with
                no video would carry an empty heading and a rule across the page. */}
            {tour && (
              <Reveal>
                <Block eyebrow="Walk through" title="Video tour">
                  <VideoTour
                    videoUrl={listing.videoUrl}
                    video={listing.video}
                    poster={listing.images[0]}
                    title={listing.title}
                  />
                </Block>
              </Reveal>
            )}

            <Reveal>
              <VerificationDossier
                status={listing.status}
                checks={checks}
                passed={verified}
                total={checks.length}
              />
            </Reveal>

            {listing.amenities.length > 0 && (
              <Reveal>
                <Block eyebrow="Inside" title="Amenities">
                  <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 max-sm:grid-cols-1">
                    {listing.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2.5 text-muted">
                        <Check className="size-4 shrink-0 text-verified" aria-hidden /> {a}
                      </li>
                    ))}
                  </ul>
                </Block>
              </Reveal>
            )}

            <Reveal>
              <Fees listing={listing} />
            </Reveal>

            <Reveal>
              <Block eyebrow="Listed by" title="Your realtor">
                <RealtorPanel realtor={realtor} />
              </Block>
            </Reveal>
          </div>

          {/* sticky action card (desktop) */}
          <aside className="max-lg:hidden">
            <div className="sticky top-24">
              <ActionCard
                listing={listing}
                realtor={realtor}
                verified={verified}
                total={checks.length}
              />
            </div>
          </aside>
        </div>
      </Container>

      <SimilarListings city={listing.address.city} exclude={listing.id} />
    </div>
  );
}

/* ---------- sections ---------- */

/** Only what the realtor actually filled in: a zero is "not applicable", not "0". */
function buildSpecs(listing: PublicListingDetail) {
  const { toilets, garage, kitchen, floors, floorArea, landSize, yearBuilt } =
    listing.features;

  const specs: { label: string; value: string }[] = [
    { label: "Category", value: typeLabel(listing.category) },
  ];

  if (yearBuilt > 0) specs.push({ label: "Year built", value: String(yearBuilt) });
  if (floors > 0) specs.push({ label: "Floors", value: String(floors) });
  if (toilets > 0) specs.push({ label: "Toilets", value: String(toilets) });
  if (kitchen > 0) specs.push({ label: "Kitchens", value: String(kitchen) });
  if (garage > 0) specs.push({ label: "Parking", value: `${garage} cars` });
  if (floorArea > 0) specs.push({ label: "Floor area", value: `${floorArea} m²` });
  if (landSize > 0) specs.push({ label: "Land size", value: `${landSize} m²` });

  specs.push({ label: "Listed", value: formatDate(listing.createdAt) });

  return specs;
}

/**
 * The real fee lines the realtor entered, on top of the asking price. Optional ones
 * are shown but kept out of the total, and nothing is inferred from the price: an
 * agency percentage this page invented was one of the numbers that had to go.
 */
function Fees({ listing }: { listing: PublicListingDetail }) {
  const { additional, paymentTerms, refundPolicy } = listing.fees;
  const required = additional.filter((f) => !f.optional);
  const total = required.reduce((sum, f) => sum + f.amount, listing.price);

  return (
    <Block eyebrow="The numbers" title="What you'll pay">
      <div className="overflow-hidden rounded-2xl border border-line">
        <FeeRow label="Asking price" amount={listing.price} />
        {additional.map((fee) => (
          <FeeRow
            key={fee.name}
            label={fee.name}
            note={fee.optional ? "optional" : undefined}
            amount={fee.amount}
          />
        ))}
        <div className="flex items-center justify-between gap-4 bg-surface-2/60 px-5 py-4">
          <span className="font-semibold text-ink">Total payable</span>
          <span className="display text-xl text-ink">{formatPriceFull(total)}</span>
        </div>
      </div>

      {(paymentTerms || refundPolicy) && (
        <dl className="mt-4 space-y-3">
          {paymentTerms && <Terms label="Payment terms" value={paymentTerms} />}
          {refundPolicy && <Terms label="Refund policy" value={refundPolicy} />}
        </dl>
      )}

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" aria-hidden />
        Every figure here is the one on the listing. Anything a realtor asks for that is
        not on this page is not part of the deal.
      </p>
    </Block>
  );
}

function Terms({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/40 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted">{value}</dd>
    </div>
  );
}

function SimilarListings({ city, exclude }: { city: string; exclude: string }) {
  // Real neighbours, asked for by city. One extra so removing this listing still leaves three.
  const { data } = usePublicListings({ ...EMPTY_QUERY, city }, 4);
  const similar = (data?.listings ?? []).filter((l) => l.id !== exclude).slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-14 max-sm:pt-10">
      <Container>
        <SectionHeading eyebrow="Keep looking" title={`More homes in ${city}`} />
        <div className="mt-10 grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {similar.map((l, i) => (
            <Reveal key={l.id} delay={(i % 3) * 0.08}>
              <PropertyCard listing={toCardListing(l)} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Block({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-8 max-sm:py-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">
        {eyebrow}
      </p>
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

function FeeRow({
  label,
  note,
  amount,
}: Pick<ListingFee, "amount"> & { label: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <span className="text-sm text-muted">
        {label}
        {note && <span className="ml-2 text-xs text-faint">{note}</span>}
      </span>
      <span className="text-sm font-medium tabular-nums text-ink">
        {formatPriceFull(amount)}
      </span>
    </div>
  );
}

function RealtorAvatar({
  realtor,
  className,
}: {
  realtor: ListingRealtorProfile;
  className: string;
}) {
  const name = displayName(realtor.fullname);

  if (!realtor.avatar)
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-surface-2 font-semibold text-muted ring-1 ring-line",
          className,
        )}
      >
        {initials(name)}
      </span>
    );

  return (
    <img
      src={realtor.avatar}
      alt={name}
      className={cn("shrink-0 rounded-full object-cover ring-1 ring-line", className)}
    />
  );
}

function RealtorPanel({ realtor }: { realtor: ListingRealtorProfile }) {
  const name = displayName(realtor.fullname);
  const line = [realtor.agencyName, realtor.city].filter(Boolean).join(" · ");

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 max-sm:flex-col max-sm:items-start">
      <RealtorAvatar realtor={realtor} className="size-16 text-lg" />
      <div className="min-w-0 flex-1">
        {/* The seal goes on the name, never the picture: an avatar is self-chosen. */}
        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {name}
          {realtor.certified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-verified/12 px-2 py-0.5 text-xs font-semibold text-verified">
              <BadgeCheck className="size-3.5" aria-hidden /> Certified
            </span>
          ) : (
            realtor.identityVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-verified/12 px-2 py-0.5 text-xs font-semibold text-verified">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified
              </span>
            )
          )}
        </p>
        {line && <p className="mt-0.5 text-sm text-muted">{line}</p>}
      </div>
      <Link
        to={`/realtors/${realtor.id}`}
        className={cn(buttonClasses("outline", "md"), "shrink-0 max-sm:w-full")}
      >
        View profile <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function ActionCard({
  listing,
  realtor,
  verified,
  total,
}: {
  listing: PublicListingDetail;
  realtor: ListingRealtorProfile;
  verified: number;
  total: number;
}) {
  const name = displayName(realtor.fullname);
  const pct = total ? Math.round((verified / total) * 100) : 0;
  const bar =
    listing.status === "verified"
      ? "bg-verified"
      : listing.status === "pending"
        ? "bg-gold"
        : "bg-rose-500";

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 max-sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="display text-3xl text-ink">{formatPriceFull(listing.price)}</p>
          <p className="mt-1 text-sm text-muted">{listing.ref}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ListingIntentBadge listingFor={listing.listingStatus} />
          <StatusBadge status={listing.status} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-surface-2/60 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <ShieldCheck className="size-4 text-verified" aria-hidden /> Documents
          </span>
          <span className="font-semibold tabular-nums text-ink">
            {verified}/{total} verified
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {total === 0
            ? "No title documents have been filed for this listing yet."
            : "Checked by INSPECTRA against the title on record."}
        </p>
      </div>

      <InquiryBox listing={listing} first={name.split(" ")[0] ?? "the realtor"} />

      <Link
        to={`/realtors/${realtor.id}`}
        className={cn(buttonClasses("outline", "md"), "mt-3 w-full")}
      >
        View realtor profile <ArrowRight className="size-4" aria-hidden />
      </Link>

      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <RealtorAvatar realtor={realtor} className="size-10 text-xs" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-sm font-medium text-ink">
            {name}
            {(realtor.certified || realtor.identityVerified) && (
              <BadgeCheck className="size-3.5 fill-verified text-white" aria-hidden />
            )}
          </p>
          {realtor.agencyName && (
            <p className="truncate text-xs text-muted">{realtor.agencyName}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The one place a conversation starts. Public page, so the session may be missing:
 * useMe is nullable, unlike useAuthUser, which throws outside a guarded route.
 *
 * A realtor or an admin sees no composer. An inquiry belongs to a buyer, and the API
 * refuses one from any other role, so offering the box would be a lie.
 */
function InquiryBox({ listing, first }: { listing: PublicListingDetail; first: string }) {
  const { pathname } = useLocation();
  const { data: user, isPending } = useMe();
  const create = useCreateInquiry();

  const [message, setMessage] = useState("");
  const [sent, setSent] = useState("");

  // Nothing is offered on a guess: the card waits for the session to resolve.
  if (isPending)
    return <div className="mt-5 h-28 animate-pulse rounded-2xl bg-surface-2/60" />;

  if (sent)
    return (
      <div className="mt-5 rounded-2xl border border-verified/30 bg-verified/5 p-4 text-sm">
        <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <Check className="size-4 text-verified" aria-hidden /> Message sent
        </p>
        <p className="mt-1 text-muted">
          {first} has been emailed. Their reply lands in your inquiries.
        </p>
        <Link
          to={`/dashboard/inquiries/${sent}`}
          className={cn(buttonClasses("brand", "md"), "mt-3 w-full")}
        >
          Open the conversation <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  if (!user)
    return (
      <div className="mt-5 rounded-2xl border border-line bg-surface-2/40 p-4 text-sm">
        <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <MessageCircle className="size-4 text-brand-ink" aria-hidden /> Message {first}
        </p>
        <p className="mt-1 text-muted">
          Sign in to ask about the documents, the fees or a viewing. Every message stays
          on INSPECTRA.
        </p>
        <Link
          to="/login"
          state={{ from: pathname }}
          className={cn(buttonClasses("brand", "md"), "mt-3 w-full")}
        >
          Sign in to message <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  if (user.role !== "seeker")
    return (
      <div className="mt-5 rounded-2xl border border-line bg-surface-2/40 p-4 text-sm">
        <p className="font-semibold text-ink">You are signed in as a {user.role}</p>
        <p className="mt-1 text-muted">
          Inquiries come from buyer accounts, so there is nothing to send from here.
        </p>
      </div>
    );

  const send = async () => {
    const body = message.trim();

    if (!body || create.isPending) return;

    try {
      const result = await create.mutateAsync({ property: listing.id, message: body });
      toast.success(result.message ?? "Your inquiry is with the realtor.");
      setSent(result.inquiry.id);
    } catch (error) {
      toast.error(apiMessage(error, "Could not send your message."));
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-line bg-surface-2/40 p-4">
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
        <MessageCircle className="size-4 text-brand-ink" aria-hidden /> Message {first}
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Ask about the documents, the fees or a viewing…"
        aria-label={`Message ${first} about this listing`}
        className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      />
      <button
        type="button"
        onClick={send}
        disabled={!message.trim() || create.isPending}
        className={cn(buttonClasses("brand", "lg"), "mt-3 w-full disabled:opacity-50")}
      >
        {create.isPending ? "Sending…" : "Send message"}
        <ArrowRight className="size-4" aria-hidden />
      </button>
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
      <Heart
        className={cn("size-4", saved ? "fill-rose-500 text-rose-500" : "text-muted")}
        aria-hidden
      />
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

function DetailSkeleton() {
  return (
    <Container className="py-10">
      <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
      <div className="mt-5 h-[26rem] animate-pulse rounded-3xl bg-surface-2 max-sm:h-64" />
      <div className="mt-8 grid grid-cols-[1fr_360px] gap-12 max-lg:grid-cols-1">
        <div className="space-y-4">
          <div className="h-5 w-32 animate-pulse rounded bg-surface-2" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
          <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-surface-2 max-lg:hidden" />
      </div>
    </Container>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <Container className="py-24 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <Building2 className="size-6" aria-hidden />
      </span>
      <h1 className="display mt-5 text-3xl text-ink">We can't find that home</h1>
      <p className="mt-2 text-muted">{message}</p>
      <Link to="/listings" className={cn(buttonClasses("primary", "lg"), "mt-6")}>
        Back to listings
      </Link>
    </Container>
  );
}
