import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, ShieldCheck, BadgeCheck, FileCheck2 } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";

// A calm Nigerian architectural backdrop, kept faint so it reads as texture.
const HERO_BG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";
// The signature visual: a real home carrying its verified status.
const HERO_HOME =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80";

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

export function AboutHero() {
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
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(177,134,58,0.10),transparent_65%)]" />

      <Container className="relative z-10 grid grid-cols-2 items-center gap-16 pb-28 pt-28 max-lg:grid-cols-1 max-lg:gap-14 max-sm:pb-20 max-sm:pt-24">
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
            Who we are
          </motion.span>

          <motion.h1
            variants={item}
            className="display mt-6 text-[4rem] leading-[1.02] text-balance max-xl:text-6xl max-lg:text-[3.4rem] max-sm:text-[2.6rem]"
          >
            Verified homes,
            <span className="block text-brand-gradient">certified realtors.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/70 max-sm:text-base"
          >
            Nigerian property has always run on trust in a person. INSPECTRA moves
            that trust to the asset itself: every listing is checked and every
            realtor is certified before anything goes live. This is who we are and
            why we built it.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-stretch"
          >
            <Link
              to="/listings"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
            >
              Browse verified listings
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/enablement"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 max-sm:h-12"
            >
              Get certified
            </Link>
          </motion.div>
        </motion.div>

        {/* signature: trust made visible on a real home */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex justify-center max-lg:order-first"
        >
          <div className="relative w-full max-w-md">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1e2b] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              <div className="relative aspect-[4/5]">
                <img
                  src={HERO_HOME}
                  alt="A verified INSPECTRA property in Lagos"
                  className="absolute inset-0 size-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0c1e2b] via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                  <StatusBadge status="verified" onPhoto />
                </div>
              </div>

              {/* proof footer */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-5">
                <ProofStat Icon={FileCheck2} label="Documents checked" value="Before it lists" />
                <ProofStat Icon={BadgeCheck} label="Realtor" value="Certified" />
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function ProofStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof FileCheck2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand/15">
        <Icon className="size-4 text-[#7ad4ff]" strokeWidth={2} aria-hidden />
      </span>
      <div>
        <p className="credential-meta text-[0.58rem] text-white/45">{label}</p>
        <p className="mt-0.5 text-[0.82rem] font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
