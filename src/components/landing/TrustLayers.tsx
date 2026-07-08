import { Check, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";

const PROPERTY_CHECKS = [
  "Ownership documents checked",
  "Title matched to the registry",
  "All fees disclosed upfront",
  "No duplicate parcel found",
];

const REALTOR_CHECKS = [
  "Certification exam passed",
  "License verified & valid",
  "61 completed deals on record",
  "No disputes on file",
];

export function TrustLayers() {
  return (
    <section id="verification" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Two layers of trust"
          title="The home is verified. The realtor is certified."
          intro="Other platforms check the agent's ID and stop there. INSPECTRA vouches for both the property and the professional — and shows you the proof."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <TrustCard
            image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=75"
            imageAlt="A verified property"
            badge={<StatusBadge status="verified" onPhoto />}
            kicker="The property"
            title="Verified before it's listed"
            checks={PROPERTY_CHECKS}
          />
          <TrustCard
            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=75"
            imageAlt="A certified realtor"
            badge={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                <BadgeCheck className="size-3.5 text-emerald-600" aria-hidden />
                Certified
              </span>
            }
            kicker="The realtor"
            title="Certified, not self-declared"
            checks={REALTOR_CHECKS}
          />
        </div>
      </Container>
    </section>
  );
}

function TrustCard({
  image,
  imageAlt,
  badge,
  kicker,
  title,
  checks,
}: {
  image: string;
  imageAlt: string;
  badge: React.ReactNode;
  kicker: string;
  title: string;
  checks: string[];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="relative">
        <img src={image} alt={imageAlt} className="h-56 w-full object-cover sm:h-64" />
        <div className="absolute left-4 top-4">{badge}</div>
      </div>
      <div className="p-6 sm:p-8">
        <span className="eyebrow">{kicker}</span>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{title}</h3>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c} className="flex items-center gap-2.5 text-sm text-muted">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-verified/15">
                <Check className="size-3 text-verified" strokeWidth={3.5} aria-hidden />
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
