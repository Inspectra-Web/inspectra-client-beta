import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, BadgeCheck, MapPin, Map, ShieldCheck, MessageCircle, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { realtors, properties } from "@/data/mock";
import { realtorMeta } from "@/lib/realtorMeta";
import { cn } from "@/lib/cn";

export function RealtorDetail() {
  const { id } = useParams();
  const realtor = realtors.find((r) => r.id === id);
  if (!realtor) return <NotFound />;

  const meta = realtorMeta(realtor);
  const first = realtor.name.split(" ")[0];
  const specialties = meta.specialties.filter(Boolean);
  const listings = properties.filter((p) => p.realtorId === realtor.id);
  const photo = `${realtor.avatar}?auto=format&fit=crop&crop=faces&w=800&h=1000&q=85`;

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
                <img src={photo} alt={realtor.name} className="size-full object-cover object-[center_18%]" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a1620]/70 to-transparent" />
                {realtor.certified && (
                  <span className="bg-brand-gradient absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[#04121f] shadow-sm">
                    <BadgeCheck className="size-3.5" aria-hidden /> Certified
                  </span>
                )}
              </div>

              <ContactCard first={first} />

              <dl className="mt-5 space-y-3 rounded-2xl border border-line p-5 text-sm">
                <Fact icon={MapPin} label="Based in" value={realtor.city} />
                <Fact icon={Map} label="Covers" value={meta.areas} />
                <Fact icon={ShieldCheck} label="Certified since" value={String(meta.since)} />
              </dl>
            </div>
          </aside>

          {/* about + listings */}
          <div className="min-w-0">
            <header className="border-b border-line pb-7">
              <h1 className="display text-4xl text-ink max-sm:text-3xl">{realtor.name}</h1>
              <p className="mt-2 text-muted">
                {realtor.agency} · {realtor.city}
              </p>
              {specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {specialties.map((s) => (
                    <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <Block eyebrow="About" title={`Working with ${first}`}>
              <p className="leading-relaxed text-muted">
                {realtor.name} is a certified INSPECTRA realtor with {realtor.agency}, working across{" "}
                {meta.areas} in {realtor.city}. Certified since {meta.since},{" "}
                {first} focuses on {specialties.join(" and ").toLowerCase() || "residential sales"}.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                Every home {first} brings to INSPECTRA is document-checked before it goes live — so what you
                see is what you can trust.
              </p>
            </Block>

            <Block eyebrow="On the market" title={`Listings by ${first}`}>
              {listings.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 max-sm:grid-cols-1">
                  {listings.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 2) * 0.08}>
                      <PropertyCard property={p} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
                  <p className="text-muted">
                    No live listings right now — {first}'s next verified home will show up here.
                  </p>
                </div>
              )}
            </Block>
          </div>
        </div>
      </Container>
    </div>
  );
}

function ContactCard({ first }: { first: string }) {
  const [sent, setSent] = useState(false);
  return sent ? (
    <div className="mt-5 flex items-center justify-center gap-1.5 rounded-full border border-verified/30 bg-verified/8 px-4 py-3 text-sm font-medium text-ink">
      <Check className="size-4 shrink-0 text-verified" aria-hidden /> Request sent — {first} will reach out
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setSent(true)}
      className={cn(buttonClasses("brand", "lg"), "mt-5 w-full")}
    >
      <MessageCircle className="size-4" aria-hidden /> Message {first}
    </button>
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

function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">Realtor</p>
      <h1 className="display mt-3 text-3xl text-ink">We can't find that realtor</h1>
      <p className="mt-2 text-muted">The profile may have moved. Browse everyone who's certified.</p>
      <Link to="/realtors" className={cn(buttonClasses("primary", "lg"), "mt-6")}>
        All realtors
      </Link>
    </Container>
  );
}
