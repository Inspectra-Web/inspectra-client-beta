import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Map,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PropertyCard } from "@/components/PropertyCard";
import { apiMessage } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { usePublicRealtor, realtorTagline } from "@/lib/realtors";
import { usePublicListings, toCardListing, EMPTY_QUERY } from "@/lib/marketplace";
import { displayName, formatDate, initials, whatsappDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

export function RealtorDetail() {
  const { id } = useParams();
  const { data: realtor, isPending, isError, error } = usePublicRealtor(id ?? "");
  // Contact details are a member feature, socials included. Same cached query the
  // contact card reads, so this costs no extra request.
  const { data: viewer } = useMe();

  if (isPending) return <ProfileSkeleton />;
  if (isError) return <NotFound message={apiMessage(error, "The profile may have moved.")} />;

  const name = displayName(realtor.fullname);
  const first = name.split(" ")[0] ?? name;
  const socials = Object.entries(realtor.socials ?? {}).filter(([, href]) => href);

  return (
    <div className="pb-20">
      <Container className="pt-8 max-sm:pt-6">
        <Link to="/realtors" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> All realtors
        </Link>
      </Container>

      <Container className="mt-6">
        <div className="grid grid-cols-[340px_1fr] gap-12 max-lg:grid-cols-1 max-lg:gap-8">
          {/* portrait + contact */}
          <aside>
            <div className="sticky top-24 max-lg:static max-lg:mx-auto max-lg:max-w-sm">
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
                {realtor.avatar ? (
                  <img
                    src={realtor.avatar}
                    alt={name}
                    className="size-full object-cover object-[center_18%]"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-surface-2">
                    <span className="display text-7xl text-faint" aria-hidden>
                      {initials(name)}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a1620]/70 to-transparent" />
                {realtor.certified ? (
                  <span className="bg-brand-gradient absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[#04121f] shadow-sm">
                    <BadgeCheck className="size-3.5" aria-hidden /> Certified
                  </span>
                ) : (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-verified px-2.5 py-1 text-xs font-semibold text-[#04121f] shadow-sm">
                    <BadgeCheck className="size-3.5" aria-hidden /> Verified
                  </span>
                )}
              </div>

              <ContactCard
                first={first}
                phone={realtor.phone}
                whatsapp={realtor.whatsapp}
                contactMeans={realtor.contactMeans}
              />

              <dl className="mt-5 space-y-3 rounded-2xl border border-line p-5 text-sm">
                {realtor.city && <Fact icon={MapPin} label="Based in" value={realtor.city} />}
                {realtor.region && <Fact icon={Map} label="Covers" value={realtor.region} />}
                {realtor.state && <Fact icon={MapPin} label="State" value={realtor.state} />}
                {realtor.availabilityStatus && (
                  <Fact icon={Clock} label="Availability" value={realtor.availabilityStatus} />
                )}
                {/* The preference is stated on the contact card instead, beside the
                    buttons it is about. */}
                <Fact icon={CalendarCheck} label="On INSPECTRA" value={formatDate(realtor.createdAt)} />
              </dl>

              {/* Gated with the numbers: an Instagram DM is a direct channel too, so
                  publishing the handle while hiding the phone would just be a hole. */}
              {viewer && socials.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium capitalize text-muted transition-colors hover:border-brand/40 hover:text-brand-ink"
                    >
                      {label}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* about */}
          <div className="min-w-0">
            <header className="border-b border-line pb-7">
              <h1 className="display text-4xl text-ink max-sm:text-3xl">{name}</h1>
              <p className="mt-2 text-muted">{realtorTagline(realtor)}</p>
              {realtor.agencyName && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                  <Building2 className="size-4 shrink-0 text-faint" aria-hidden />
                  {realtor.agencyName}
                  {realtor.agencyAddress && ` · ${realtor.agencyAddress}`}
                </p>
              )}
              {realtor.specialization.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {realtor.specialization.filter(Boolean).map((s) => (
                    <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {realtor.bio && (
              <Block eyebrow="About" title={`Working with ${first}`}>
                {/* The bio carries its own line breaks, which HTML would otherwise collapse. */}
                <p className="whitespace-pre-line leading-relaxed text-muted">{realtor.bio}</p>
              </Block>
            )}
          </div>
        </div>
      </Container>

      {/* Full width, below the two-column grid: a card grid needs the whole stage. */}
      <RealtorListings id={realtor.id} first={first} />
    </div>
  );
}

const LISTINGS_PER_PAGE = 6;

/**
 * What this realtor has on the market. The same browse endpoint the marketplace
 * reads, narrowed to one owner, so the cards and the verification badges here are
 * the ones a buyer sees on /listings.
 */
function RealtorListings({ id, first }: { id: string; first: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isPlaceholderData } = usePublicListings(
    { ...EMPTY_QUERY, realtor: id, page },
    LISTINGS_PER_PAGE,
  );

  const listings = data?.listings ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // A realtor with nothing on the market gets no empty band, and neither does a
  // failed request: this section is not the reason the reader came to the page.
  if (isError || (!isPending && total === 0)) return null;

  return (
    <section className="mt-16 border-t border-line pt-14 max-sm:mt-12 max-sm:pt-10">
      <Container>
        <SectionHeading
          eyebrow="On the market"
          title={isPending ? `Listings from ${first}` : `${total} listing${total === 1 ? "" : "s"} from ${first}`}
        />

        <div
          className={cn(
            "mt-10 grid grid-cols-3 gap-x-6 gap-y-10 transition-opacity max-lg:grid-cols-2 max-sm:grid-cols-1",
            isPlaceholderData && "opacity-60",
          )}
        >
          {isPending
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <div className="aspect-[10/9] animate-pulse rounded-2xl bg-surface-2" />
                  <div className="space-y-2 pt-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                  </div>
                </div>
              ))
            : listings.map((l, i) => (
                <Reveal key={l.id} delay={(i % 3) * 0.08}>
                  <PropertyCard listing={toCardListing(l)} />
                </Reveal>
              ))}
        </div>

        {pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Button>
            <span className="text-sm tabular-nums text-muted">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * Reach them directly, once you have an account: contacting a realtor is for registered
 * users, so a visitor gets the sign-in path instead of the buttons.
 *
 * The gate is this component, not the API. `GET /realtors/:id` still carries the numbers,
 * so they are readable to anyone who looks at the response rather than the page. That is
 * the accepted trade for not adding an endpoint; moving them behind an authenticated read
 * is what would make the gate real.
 *
 * Every channel is a button and no number is printed, so the digits stay in the href
 * rather than in copy. Both channels are offered whatever `contactMeans` says, which is
 * stated rather than enforced.
 *
 * WhatsApp takes the brand accent rather than its own green, which would be another
 * company's colour sitting in the middle of this palette.
 */
function ContactCard({
  first,
  phone,
  whatsapp,
  contactMeans,
}: {
  first: string;
  phone: string;
  whatsapp: string;
  contactMeans: string;
}) {
  const { pathname } = useLocation();
  // Nullable, unlike useAuthUser: this is a public route, so there may be no session.
  const { data: user, isPending } = useMe();

  // Nothing is offered on a guess while the session resolves.
  if (isPending)
    return <div className="mt-5 h-12 animate-pulse rounded-full bg-surface-2/60" />;

  if (!user)
    return (
      <div className="mt-5 rounded-2xl border border-line bg-surface-2/40 p-4 text-sm">
        <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <MessageCircle className="size-4 text-brand-ink" aria-hidden /> Contact {first}
        </p>
        <p className="mt-1 text-muted">
          Phone and WhatsApp are for registered users. Signing up is free.
        </p>
        <Link
          to="/login"
          state={{ from: pathname }}
          className={cn(buttonClasses("brand", "md"), "mt-3 w-full")}
        >
          Sign in to contact <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  if (!phone && !whatsapp)
    return (
      <p className="mt-5 rounded-2xl border border-line bg-surface-2/40 px-4 py-3 text-center text-sm text-muted">
        {first} has not listed a phone number yet. Message them from any of their
        listings and it reaches them by email.
      </p>
    );

  return (
    <div className="mt-5 space-y-2">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsappDigits(whatsapp)}`}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonClasses("brand", "lg"), "w-full")}
        >
          <MessageCircle className="size-4" aria-hidden /> WhatsApp {first}
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className={cn(buttonClasses("outline", "lg"), "w-full")}
        >
          <Phone className="size-4" aria-hidden /> Call {first}
        </a>
      )}
      {contactMeans && (
        <p className="pt-1 text-center text-xs text-muted">
          Prefers to be reached on {contactMeans.toLowerCase()}
        </p>
      )}
    </div>
  );
}

function Block({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-8 last:border-b-0 max-sm:py-7">
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
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-faint" aria-hidden />
      <dt className="text-muted">{label}</dt>
      <dd className="ml-auto text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <Container className="py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">Realtor</p>
      <h1 className="display mt-3 text-3xl text-ink">We can't find that realtor</h1>
      <p className="mt-2 text-muted">{message}</p>
      <Link to="/realtors" className={cn(buttonClasses("primary", "lg"), "mt-6")}>
        All realtors
      </Link>
    </Container>
  );
}

function ProfileSkeleton() {
  return (
    <Container className="py-10">
      <div className="h-5 w-28 animate-pulse rounded bg-surface-2" />
      <div className="mt-6 grid grid-cols-[340px_1fr] gap-12 max-lg:grid-cols-1 max-lg:gap-8">
        <div className="max-lg:mx-auto max-lg:w-full max-lg:max-w-sm">
          <div className="aspect-4/5 animate-pulse rounded-3xl bg-surface-2" />
          <div className="mt-5 h-13 animate-pulse rounded-full bg-surface-2" />
          <div className="mt-5 h-40 animate-pulse rounded-2xl bg-surface-2" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded bg-surface-2" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-surface-2" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      </div>
    </Container>
  );
}
