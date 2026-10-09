import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, BadgeCheck, Tag } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";

const HERO_IMAGE =
  "https://images.pexels.com/photos/10376015/pexels-photo-10376015.jpeg?auto=compress&cs=tinysrgb&w=2000";

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

export function RealtorHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-[#06121b]">
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[#06121b]/40" />
      <div className="absolute inset-0 bg-linear-to-r from-[#06121b] via-[#06121b]/50 via-35% to-transparent to-70% max-lg:via-[#06121b]/80 max-lg:to-[#06121b]/40" />

      <Container className="relative z-10 pb-24 pt-28 max-sm:pb-20 max-sm:pt-16">
        <motion.div
          className="max-w-2xl"
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <motion.span
            variants={item}
            className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/70"
          >
            For realtors
          </motion.span>

          <motion.h1
            variants={item}
            className="display mt-5 text-[4rem] leading-[1.04] text-white text-balance max-xl:text-6xl max-lg:text-[3.4rem] max-sm:text-[2.9rem]"
          >
            Be the realtor buyers
            <span className="block text-[#38c0ff]">already trust.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-[1.06rem]"
          >
            Verify once, list homes whose documents have cleared review, and meet
            serious buyers who book and pay for inspections in-app. Your
            reputation does the selling.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-start"
          >
            <Link
              to="/register?role=realtor"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
            >
              Create a realtor account
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 max-sm:h-12"
            >
              <Tag className="size-4" aria-hidden />
              See plans
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 pr-5 backdrop-blur-md max-sm:mt-10"
          >
            <span className="grid size-10 place-items-center rounded-full bg-emerald-400/15">
              <BadgeCheck className="size-6 text-emerald-300" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Verified realtor</p>
              <p className="text-xs text-white/60">
                The badge buyers look for, on every listing you post
              </p>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
