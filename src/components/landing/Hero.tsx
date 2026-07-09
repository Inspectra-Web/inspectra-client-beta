import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";
import { Typewriter } from "@/components/ui/Typewriter";
import { cn } from "@/lib/cn";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#06121b] text-center max-md:min-h-0">
      {/* backdrop */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[#06121b]/72" />
      <div className="absolute inset-0 bg-linear-to-t from-[#06121b] via-transparent to-[#06121b]/60" />

      <Container className="relative z-10 pb-24 pt-28 max-sm:pb-16">
        <motion.div
          className="mx-auto max-w-4xl"
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <motion.span
            variants={item}
            className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/70"
          >
            Verified homes · Certified realtors
          </motion.span>

          <motion.h1
            variants={item}
            className="display mt-5 text-[4.25rem] leading-[1.02] text-white text-balance max-xl:text-7xl max-lg:text-6xl max-sm:text-[3rem]"
          >
            Verified homes to
            <span className="mt-1 block text-[#38c0ff]">
              <Typewriter words={["Rent", "Buy", "Lease", "Shortlet"]} />
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-base"
          >
            INSPECTRA checks the documents, the title and the fees on every
            listing, and certifies every realtor. The only properties you find
            are ones you can trust.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-9 flex items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch"
          >
            <Link
              to="/listings"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
            >
              Browse verified homes
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/enablement"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 max-sm:h-12"
            >
              <BadgeCheck className="size-4" aria-hidden />
              Get certified as a realtor
            </Link>
          </motion.div>
        </motion.div>
      </Container>

      <ScrollCue className={cn(reduced && "hidden")} />
    </section>
  );
}

function ScrollCue({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-x-0 bottom-6 mx-auto flex w-full justify-center max-lg:hidden",
        className,
      )}
    >
      <span className="flex h-9 w-6 items-start justify-center rounded-full border border-white/30 p-1.5">
        <span className="size-1.5 animate-bounce rounded-full bg-white/70" />
      </span>
    </div>
  );
}
