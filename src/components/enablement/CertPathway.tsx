import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const PATHWAY_IMAGE =
  "https://images.unsplash.com/photo-1573496528298-f0e9d3c7ce55?auto=format&fit=crop&crop=faces&w=1000&q=80";

const STAGES = [
  {
    n: "01",
    title: "Enroll",
    body: "Register online and pick your schedule: Full-time through the week, or Executive at weekends. Study materials are issued upfront.",
    meta: "Weekdays or weekends",
  },
  {
    n: "02",
    title: "Train",
    body: "Thirteen subjects taught by practising professionals, from the legal framework and valuation to running your own practice.",
    meta: "13 subjects",
  },
  {
    n: "03",
    title: "Practise",
    body: "Weekly assessments track you as you go, then a one month internship puts the curriculum on real transactions.",
    meta: "Weekly, plus internship",
  },
  {
    n: "04",
    title: "Get certified",
    body: "A final exam built on real scenarios, not recall. Pass it and Certified shows on your profile and every listing.",
    meta: "Online exam",
    last: true,
  },
];

export function CertPathway() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-surface-2/50 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="The pathway"
          title="From enrolled to certified"
          intro="One level of certification, one route to it, all of it online."
        />

        <div className="mt-16 grid grid-cols-[1.25fr_0.75fr] items-stretch gap-14 max-xl:gap-10 max-lg:grid-cols-1 max-sm:mt-12">
          {/* the pathway spine */}
          <div className="relative min-w-0">
          <span
            className="absolute left-[1.4rem] top-3 bottom-3 w-px bg-line max-sm:left-[1.15rem]"
            aria-hidden
          />

          <ol className="space-y-11 max-sm:space-y-9">
            {STAGES.map((stage, i) => (
              <motion.li
                key={stage.n}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                className="relative flex gap-6 max-sm:gap-5"
              >
                {/* node */}
                <span
                  className={cn(
                    "relative z-10 grid size-11 shrink-0 place-items-center rounded-full border max-sm:size-9",
                    stage.last
                      ? "border-transparent bg-foil text-[#06121b] shadow-[0_10px_24px_-10px_rgba(177,134,58,0.9)]"
                      : "border-line bg-surface text-brand-ink",
                  )}
                >
                  {stage.last ? (
                    <BadgeCheck className="size-5.5 max-sm:size-5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span className="display text-base">{stage.n}</span>
                  )}
                </span>

                {/* content */}
                <div className="min-w-0 pt-1 pb-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="display text-2xl max-sm:text-xl">{stage.title}</h3>
                    <span
                      className={cn(
                        "credential-meta text-[0.6rem]",
                        stage.last ? "text-foil" : "text-faint",
                      )}
                    >
                      {stage.meta}
                    </span>
                  </div>
                  <p className="mt-2 max-w-xl text-[0.98rem] leading-relaxed text-muted">
                    {stage.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
          </div>

          {/* side image */}
          <Reveal
            delay={0.1}
            className="relative overflow-hidden rounded-3xl border border-line max-lg:hidden"
          >
            <img
              src={PATHWAY_IMAGE}
              alt="A realtor working through the online certification program"
              className="absolute inset-0 size-full object-cover object-[35%_center]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
