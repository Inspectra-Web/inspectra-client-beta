import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    n: "01",
    title: "Search verified homes",
    body: "Browse listings whose documents and title have already cleared review, ranked by trust rather than by who paid to appear first.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
  },
  {
    n: "02",
    title: "Review everything upfront",
    body: "Open the documents, the itemized fees and the neighborhood details before you make a single call.",
    image:
      "https://images.unsplash.com/photo-1598994975562-07d0d752f66d?auto=format&fit=crop&crop=faces&w=1000&q=80",
  },
  {
    n: "03",
    title: "Book an inspection",
    body: "Reserve a slot and pay securely in-app, so you get a receipt and a record, not cash in an envelope.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
  },
  {
    n: "04",
    title: "Move in with confidence",
    body: "Close knowing the home, the fees and the agent all checked out from the very beginning.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 max-lg:py-24 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Your whole search, on solid ground"
          intro="Four simple steps take you from browsing to your keys, each one backed by verification you can see."
        />

        <div className="mt-20 flex flex-col gap-20 max-lg:mt-14 max-lg:gap-16">
          {STEPS.map((step, i) => (
            <Row key={step.n} step={step} reverse={i % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Row({
  step,
  reverse,
}: {
  step: (typeof STEPS)[number];
  reverse: boolean;
}) {
  return (
    <div className="grid grid-cols-2 items-center gap-14 max-lg:grid-cols-1 max-lg:gap-8">
      {/* image */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-line",
          reverse ? "order-2 max-lg:order-1" : "order-1",
        )}
      >
        <img
          src={step.image}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute left-6 top-6 grid size-12 place-items-center rounded-full bg-white/95 text-brand-ink shadow-sm">
          <span className="display text-lg">{step.n}</span>
        </span>
      </motion.div>

      {/* text */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(reverse ? "order-1 max-lg:order-2" : "order-2")}
      >
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brand-ink">
          Step {step.n}
        </span>
        <h3 className="display mt-3 text-4xl max-sm:text-3xl">{step.title}</h3>
        <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-muted">
          {step.body}
        </p>
      </motion.div>
    </div>
  );
}
