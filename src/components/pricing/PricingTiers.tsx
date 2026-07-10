import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TIERS, type BillingCadence, type Tier } from "@/data/pricing";

export function PricingTiers() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");

  return (
    <section className="pb-28 max-lg:pb-20 max-sm:pb-16">
      <Container>
        <BillingToggle cadence={cadence} onChange={setCadence} />

        <div className="mt-14 grid grid-cols-3 items-start gap-6 max-lg:grid-cols-1 max-lg:mx-auto max-lg:max-w-lg max-sm:mt-10">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.08}>
              <TierCard tier={tier} cadence={cadence} />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          All plans require a one-time realtor certification first.{" "}
          <Link to="/enablement" className="font-semibold text-brand-ink hover:underline">
            See how certification works
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}

function BillingToggle({
  cadence,
  onChange,
}: {
  cadence: BillingCadence;
  onChange: (c: BillingCadence) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
        {(["monthly", "annual"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={cadence === c}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors",
              cadence === c
                ? "bg-ink text-bg"
                : "text-muted hover:text-ink",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <span
        className={cn(
          "text-sm font-medium transition-opacity",
          cadence === "annual" ? "text-verified opacity-100" : "text-muted opacity-70",
        )}
      >
        Pay yearly and get two months free.
      </span>
    </div>
  );
}

function TierCard({ tier, cadence }: { tier: Tier; cadence: BillingCadence }) {
  const isFree = tier.monthly === 0;
  const highlighted = tier.highlighted;
  const savings = tier.monthly * 12 - tier.annual;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[1.35rem] border bg-surface p-8 transition-all duration-300 max-sm:p-7",
        highlighted
          ? "border-brand/60 shadow-[0_24px_60px_-34px_rgba(26,172,240,0.55)] ring-1 ring-brand/25 lg:-translate-y-2"
          : "border-line hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="display text-2xl">{tier.name}</h3>
        {highlighted && (
          <span className="rounded-full bg-brand/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-brand-ink">
            Most popular
          </span>
        )}
      </div>

      <p className="mt-2 min-h-11 text-[0.9rem] leading-relaxed text-muted">
        {tier.tagline}
      </p>

      {/* price */}
      <div className="mt-6">
        {isFree ? (
          <>
            <span className="display text-5xl">Free</span>
            <p className="mt-2 text-sm text-faint">No card required.</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="display text-5xl tabular-nums max-sm:text-[2.6rem]">
                {formatPriceFull(cadence === "monthly" ? tier.monthly : tier.annual)}
              </span>
              <span className="text-sm text-muted">
                {cadence === "monthly" ? "/month" : "/year"}
              </span>
            </div>
            <p className="mt-2 text-sm text-faint">
              {cadence === "monthly"
                ? `Or ${formatPriceFull(tier.annual)}/year, two months free.`
                : `Save ${formatPriceFull(savings)} against paying monthly.`}
            </p>
          </>
        )}
      </div>

      <Link
        to="/register"
        className={cn(
          "mt-7 w-full",
          buttonClasses(highlighted ? "brand" : "outline", "lg"),
        )}
      >
        {tier.ctaLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="mt-8 space-y-3 border-t border-line pt-7">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-[0.95rem] text-ink/85">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-verified/15">
              <Check className="size-3 text-verified" strokeWidth={3.5} aria-hidden />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
