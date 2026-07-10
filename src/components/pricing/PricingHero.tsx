import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";

// Full-bleed backdrop: a residential property in Lagos, Nigeria, kept dark and legible
// with a scrim. Photo by Joshua Oluwagbemiga (Akiogun Road, Maroko, Lagos).
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1531300365552-da5abe58a725?auto=format&fit=crop&w=2000&q=80";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const HIGHLIGHTS = [
  "Start free",
  "Verified listings that convert",
  "No pay-to-boost auctions",
];

export function PricingHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#06121b] text-center text-white">
      {/* full-bleed architectural backdrop */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      {/* legibility + depth washes over the image */}
      <div className="absolute inset-0 bg-[#06121b]/72" />
      <div className="absolute inset-0 bg-linear-to-t from-[#06121b] via-transparent to-[#06121b]/60" />
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.1),transparent_65%)]" />

      <Container className="relative z-10 flex flex-col items-center pb-28 pt-32 max-sm:pb-20 max-sm:pt-28">
        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/80"
          >
            <TrendingUp className="size-3.5 text-[#38c0ff]" aria-hidden />
            Realtor plans
          </motion.span>

          <motion.h1
            variants={item}
            className="display mt-6 max-w-4xl text-[4rem] leading-[1.02] text-balance max-xl:text-6xl max-lg:text-[3.4rem] max-sm:text-[2.6rem]"
          >
            Pricing built to
            <span className="block text-brand-gradient">grow your listings.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-base"
          >
            One certification to earn buyer trust, then a plan that scales with how
            much you list. No auctions to appear first, no fees to buy a badge, just
            verified listings serious buyers act on.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-stretch"
          >
            <Link
              to="/register"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
            >
              Start free
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href="#compare"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 max-sm:h-12"
            >
              Compare plans
            </a>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60"
          >
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#38c0ff]" aria-hidden />
                {h}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </Container>
    </section>
  );
}
