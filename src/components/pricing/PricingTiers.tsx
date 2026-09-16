import { useState } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  CADENCES,
  CADENCE_PER,
  TIERS,
  cadenceSavings,
  discountLabel,
  tierMonthlyRate,
  tierPrice,
  type BillingCadence,
  type Tier,
} from "@/data/pricing";

const CADENCE_NOTE: Record<BillingCadence, string> = {
  monthly: "Pay as you go. Change or cancel at the end of any month.",
  quarterly: "Pay three months up front and save 10%.",
  annual: "Pay for the year up front and save 20%.",
};

/**
 * The cards share one row grid rather than each stacking its own content: a tagline that
 * wraps to three lines on one tier and two on another would otherwise push that card's
 * price, button and feature list out of line with its neighbours. Each card spans all six
 * rows and re-uses the parent's tracks through `grid-rows-subgrid`, so badge, name,
 * tagline, price, CTA and features each sit on one shared baseline across all four.
 *
 * Because the tracks are shared, the row gap has to stay zero: a row gap on this grid opens
 * that same gap inside every card. Vertical rhythm therefore lives on the row elements
 * themselves, and below xl (where the cards drop to two up and then one up, and need real
 * space between the rows of cards) each card falls back to an ordinary flex column.
 */
const CARD_ROWS =
  "row-span-6 grid grid-rows-subgrid max-xl:row-span-1 max-xl:flex max-xl:flex-col";

export function PricingTiers() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");

  return (
    <section className="pb-28 max-lg:pb-20 max-sm:pb-16">
      {/* Four tiers need more room than the 6xl reading measure. */}
      <Container className="max-w-[84rem]">
        <BillingToggle cadence={cadence} onChange={setCadence} />

        <div className="mt-14 grid grid-cols-4 grid-rows-[repeat(6,auto)] gap-x-6 gap-y-0 max-xl:mx-auto max-xl:max-w-4xl max-xl:grid-cols-2 max-xl:grid-rows-none max-xl:gap-7 max-sm:mt-10 max-sm:max-w-md max-sm:grid-cols-1">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.07} className={cn(CARD_ROWS, "max-xl:block")}>
              <TierCard tier={tier} cadence={cadence} />
            </Reveal>
          ))}
        </div>

        <p className="mt-12 text-center text-sm">
          <a
            href="#compare"
            className="inline-flex items-center gap-1.5 font-semibold text-brand-ink hover:underline"
          >
            See subscription breakdown
            <ArrowDown className="size-4" aria-hidden />
          </a>
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
      <div className="inline-flex items-center rounded-full border border-line bg-surface p-1 max-sm:w-full">
        {CADENCES.map((c) => {
          const active = cadence === c;
          const discount = discountLabel(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors max-sm:flex-1 max-sm:justify-center max-sm:gap-1.5 max-sm:px-3",
                active ? "bg-ink text-bg" : "text-muted hover:text-ink",
              )}
            >
              {c}
              {discount && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums transition-colors",
                    active ? "bg-bg/20 text-bg" : "bg-verified/12 text-verified",
                  )}
                >
                  {discount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <span className="text-sm font-medium text-muted">{CADENCE_NOTE[cadence]}</span>
    </div>
  );
}

function TierCard({ tier, cadence }: { tier: Tier; cadence: BillingCadence }) {
  const isFree = tier.monthly === 0;
  const highlighted = tier.highlighted;
  const price = tierPrice(tier, cadence);
  const savings = cadenceSavings(tier, cadence);
  const perMonth = tierMonthlyRate(tier, cadence);

  return (
    <div
      className={cn(
        CARD_ROWS,
        // min-w-0: a grid item floors at its content's min-content width, and the longest
        // CTA label would otherwise push this card past its column (see CLAUDE.md).
        "min-w-0 rounded-[1.35rem] border bg-surface px-8 pb-8 pt-7 transition-colors duration-300 max-xl:h-full max-xl:px-7 max-sm:px-6",
        highlighted
          ? "border-brand/60 shadow-[0_24px_60px_-34px_rgba(26,172,240,0.55)] ring-1 ring-brand/25"
          : "border-line hover:border-brand/40",
      )}
    >
      {/* Every card renders this row, badge or not, so the names stay on one line. */}
      <div className="flex h-6 items-center">
        {highlighted && (
          <span className="rounded-full bg-brand/12 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-brand-ink">
            Most popular
          </span>
        )}
      </div>

      <h3 className="display mt-3 text-2xl">{tier.name}</h3>

      <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{tier.tagline}</p>

      <div className="mt-6">
        {/* Baseline-aligned on one line: the longest amount (₦576,000) plus its suffix
            still fits the card measure at this size, so no tier wraps where others do. */}
        <div className="flex items-baseline gap-x-1.5">
          <span className="display text-[2.3rem] leading-none tabular-nums">
            {isFree ? "Free" : formatPriceFull(price)}
          </span>
          {!isFree && <span className="text-sm text-muted">{CADENCE_PER[cadence]}</span>}
        </div>
        <p className="mt-2.5 text-sm text-faint">
          {isFree ? (
            "No card required."
          ) : cadence === "monthly" ? (
            "Billed every month."
          ) : (
            <>
              Works out at {formatPriceFull(perMonth)} a month.
              <span className="mt-0.5 block font-semibold text-verified">
                You save {formatPriceFull(savings)}.
              </span>
            </>
          )}
        </p>
      </div>

      <Link
        to="/register"
        // px-4 rather than the lg default px-8: the button is full width, so its label is
        // centred regardless, and the wide padding only inflated the card's min-content.
        className={cn("mt-7", buttonClasses(highlighted ? "brand" : "outline", "lg", "w-full px-4"))}
      >
        {tier.ctaLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="mt-8 space-y-3.5 border-t border-line pt-7">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-ink/85"
          >
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
