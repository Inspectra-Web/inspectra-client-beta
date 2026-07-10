import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const HORIZON: { step: string; title: string; body: string }[] = [
  {
    step: "Now",
    title: "Verified listings and certified realtors",
    body: "Dual verification, upfront fees and trust-ranked search, live on the platform today.",
  },
  {
    step: "Next",
    title: "Deeper checks, faster",
    body: "In-app payments, richer property records and remote-ready tools that let buyers decide from anywhere.",
  },
  {
    step: "The horizon",
    title: "The trusted layer for Nigerian property",
    body: "As property records digitize across the country, INSPECTRA becomes the marketplace that sits on top of that trusted infrastructure.",
  },
];

export function AboutVision() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-[0.9fr_1.1fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          <SectionHeading
            eyebrow="Where we're going"
            title="Building toward a market that trusts itself."
            intro="Verification is expensive and deliberate work, and we are early. The direction is fixed: make trust the default, not the exception, for every property transaction in Nigeria."
          />

          <ol className="relative space-y-10 border-l border-line pl-8 max-sm:pl-6">
            {HORIZON.map((h, i) => (
              <Reveal key={h.step} delay={i * 0.08} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[2.35rem] top-1 grid size-4 place-items-center rounded-full border-2 border-brand bg-bg max-sm:-left-[1.85rem]"
                >
                  <span className="size-1.5 rounded-full bg-brand" />
                </span>
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brand-ink">
                  {h.step}
                </span>
                <h3 className="display mt-2 text-2xl max-sm:text-xl">{h.title}</h3>
                <p className="mt-2.5 max-w-lg text-[1rem] leading-relaxed text-muted">
                  {h.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
