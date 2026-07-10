import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const REALTOR_IMAGE =
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&crop=faces&w=900&q=80";

// Subtle architectural backdrop, kept very faint so it reads as texture, not a photo.
const HERO_BG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80";

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

export function CertHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#06121b] text-white">
      {/* subtle architectural backdrop */}
      <img
        src={HERO_BG}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.14]"
      />
      {/* ambient depth + legibility washes over the image */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-transparent to-[#06121b]" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#06121b] via-[#06121b]/55 to-transparent max-lg:from-[#06121b]/80 max-lg:via-[#06121b]/60" />
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(177,134,58,0.12),transparent_65%)]" />

      <Container className="relative z-10 grid grid-cols-2 items-center gap-16 pb-28 pt-28 max-lg:grid-cols-1 max-lg:gap-14 max-lg:pt-28 max-sm:pb-20 max-sm:pt-24">
        {/* copy */}
        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/80"
          >
            <ShieldCheck className="size-3.5 text-[#38c0ff]" aria-hidden />
            Realtor certification
          </motion.span>

          <motion.h1
            variants={item}
            className="display mt-6 text-[4rem] leading-[1.02] text-balance max-xl:text-6xl max-lg:text-[3.4rem] max-sm:text-[2.6rem]"
          >
            Be the standard,
            <span className="block text-foil">not the risk.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/70 max-sm:text-base"
          >
            On INSPECTRA, every realtor gets certified before they can list. Train
            on the ground that matters, pass the exam once, and earn a credential
            buyers recognize on your profile, on your listings, in every deal.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-stretch"
          >
            <Link
              to="/register"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
            >
              Start certification
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href="#syllabus"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 max-sm:h-12"
            >
              See the syllabus
            </a>
          </motion.div>
        </motion.div>

        {/* signature: the earned credential */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex justify-center max-lg:order-first"
        >
          <CredentialCard reduced={!!reduced} />
        </motion.div>
      </Container>
    </section>
  );
}

/** A modern digital credential: photo + verifiable data footer, not a paper cert. */
function CredentialCard({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative w-full max-w-sm">
      {/* foil edge glow */}
      <div className="absolute -inset-px rounded-[1.6rem] bg-foil opacity-40 blur-[1px]" aria-hidden />

      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1e2b] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        {/* photo */}
        <div className="relative aspect-[4/5]">
          <img
            src={REALTOR_IMAGE}
            alt="Adaeze Okafor, a certified INSPECTRA realtor"
            className="absolute inset-0 size-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0c1e2b] via-transparent to-transparent" />

          {/* the stamped seal: the signature moment */}
          <div
            className={cn(
              "absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/5 [transform-origin:top_right]",
              !reduced && "cert-stamp",
            )}
          >
            <span className="grid size-6 place-items-center rounded-full bg-foil">
              <BadgeCheck className="size-4 text-[#06121b]" strokeWidth={2.75} aria-hidden />
            </span>
            <span className="text-xs font-bold tracking-wide text-slate-900">
              Certified
            </span>
          </div>
        </div>

        {/* verifiable data footer */}
        <div className="space-y-3 border-t border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="credential-meta text-[0.62rem] text-foil">
              Certified Realtor
            </span>
            <span className="credential-meta text-[0.62rem] text-white/40">
              INSPECTRA
            </span>
          </div>
          <p className="display text-2xl text-white">Adaeze Okafor</p>
          <div className="credential-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.62rem] text-white/55">
            <span>INS-CR-2026-0473</span>
            <span className="text-white/25">·</span>
            <span>Issued Jul 2026</span>
            <span className="text-white/25">·</span>
            <span>Valid through Jul 2028</span>
          </div>
        </div>
      </div>
    </div>
  );
}
