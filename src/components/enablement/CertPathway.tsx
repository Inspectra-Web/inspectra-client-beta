import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const PATHWAY_IMAGE =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&crop=faces&w=1000&q=80";

const STAGES = [
  {
    n: "01",
    title: "Enroll",
    body: "Create your realtor account and pay the one-time fee to join the next cohort. No subscription, no renewals to pass.",
    meta: "One-time payment",
  },
  {
    n: "02",
    title: "Train",
    body: "Work through six self-paced modules of video and reading, from reading a C of O to closing with a buyer abroad. Your progress saves as you go.",
    meta: "6 modules · ~8 hours",
  },
  {
    n: "03",
    title: "Sit the exam",
    body: "Take a timed assessment across the full syllabus. Score 75% or higher to pass; you get two free retakes if you don't clear it the first time.",
    meta: "40 questions · 60 min · 75% to pass",
  },
  {
    n: "04",
    title: "Get certified",
    body: "Pass and your credential is issued on the spot. Your Certified status shows on your profile and every listing, recognized by every buyer on INSPECTRA.",
    meta: "Valid two years",
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
          intro="A single, honest route with no shortcuts to certification. Here's every stage between signing up and carrying the credential."
        />

        <div className="mt-16 grid grid-cols-[1.05fr_0.95fr] items-stretch gap-14 max-lg:grid-cols-1 max-sm:mt-12">
          {/* the pathway spine */}
          <div className="relative">
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
                <div className="pt-1 pb-1">
                  <div className="flex items-baseline gap-3">
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
              alt="A realtor working through the certification program"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
