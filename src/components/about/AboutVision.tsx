import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";

// A wide architectural horizon, kept faint so the statement carries the section.
const VISION_BG =
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80";

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "Proof before persuasion",
    body: "A listing should answer for itself. No one should have to take a stranger's word for what a property is.",
  },
  {
    title: "A standard to sell here",
    body: "A marketplace is only as trusted as the people inside it, so the bar to list stays high and stays the same for everyone.",
  },
  {
    title: "Verified, or not listed",
    body: "A home reaches the market here only once it is verified. There is nothing unchecked to sift past and nothing for a buyer to second-guess.",
  },
];

export function AboutVision() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#06121b] py-28 text-white max-lg:py-20 max-sm:py-16">
      <img
        src={VISION_BG}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.16]"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-[#06121b]/70 to-[#06121b]" />
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.16),transparent_65%)]" />

      <Container className="relative z-10 grid grid-cols-[1.05fr_0.95fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#7ad4ff]">
            Our vision
          </span>
          <h2 className="display mt-4 text-[2.9rem] leading-[1.08] text-balance max-lg:text-4xl max-sm:mt-3 max-sm:text-[2rem]">
            A property market that
            <span className="block text-brand-gradient">trusts itself.</span>
          </h2>
          <div className="mt-6 max-w-lg space-y-5 text-[1.05rem] leading-relaxed text-white/70 max-sm:text-base">
            <p>
              We want a Nigeria where buying a home does not begin with knowing the
              right person, and where a family living abroad can commit to a property
              they have never stood in because the proof arrived before the pitch did.
            </p>
            <p>
              That market does not exist yet. Building it is slow, deliberate work and
              we are early. What does not move is the direction: every home carries its
              own evidence, and everyone selling one is accountable for it.
            </p>
          </div>
        </motion.div>

        <div className="space-y-px">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.08,
              }}
              className="border-t border-white/12 py-7 first:border-t-0 first:pt-0 last:pb-0 max-sm:py-6"
            >
              <h3 className="display text-xl text-white max-sm:text-lg">{p.title}</h3>
              <p className="mt-2.5 max-w-md text-[0.98rem] leading-relaxed text-white/60">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
