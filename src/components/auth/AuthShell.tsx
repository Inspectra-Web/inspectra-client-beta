import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import logoLight from "@/assets/inspectra-logo-primary-lg.png";
import logoWhite from "@/assets/inspectra-logo-white-lg.png";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Subtle architectural backdrop for the dark side panel, kept faint so it reads as
// texture and not a photo (mirrors the CertHero treatment).
const SIDE_BG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export interface AuthSide {
  eyebrow: string;
  headline: ReactNode;
  sub: string;
  proof: ReactNode;
}

/**
 * The shared split-screen auth frame: a calm form panel (left) beside a full-bleed dark
 * architectural panel carrying a trust proof (right). The dark panel is hidden below lg,
 * where the page collapses to the form only. Auth routes render with no global chrome
 * (see RootLayout), so this owns the full viewport and its own minimal top bar.
 */
export function AuthShell({
  side,
  children,
}: {
  side: AuthSide;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="grid min-h-svh grid-cols-2 bg-bg max-lg:grid-cols-1">
      {/* form panel */}
      <div className="relative flex min-h-svh flex-col px-10 py-8 max-lg:px-6 max-sm:px-5">
        {/* below lg the dark panel is hidden, so the form gets the architectural photo as
            its own backdrop (dark scrim) with the form floating in a surface card. */}
        <div className="absolute inset-0 hidden max-lg:block" aria-hidden>
          <img src={SIDE_BG} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-[#06121b]/80" />
          <div className="absolute inset-0 bg-linear-to-t from-[#06121b] via-[#06121b]/40 to-[#06121b]/70" />
        </div>

        {/* minimal top bar */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="INSPECTRA home">
            {/* desktop follows the theme; on the dark mobile backdrop the logo is always white */}
            <img
              src={logoLight}
              alt="INSPECTRA"
              className="hidden h-9 w-auto lg:block dark:lg:hidden"
            />
            <img
              src={logoWhite}
              alt="INSPECTRA"
              className="h-9 w-auto max-lg:block lg:hidden dark:lg:block"
            />
          </Link>
          <ThemeToggle className="max-lg:hidden" />
          <ThemeToggle onDark className="hidden max-lg:inline-flex" />
        </div>

        {/* centered form column */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-10 max-lg:py-8 max-sm:py-6">
          <div className="mx-auto w-full max-w-[26rem] max-lg:max-w-xl max-lg:rounded-3xl max-lg:border max-lg:border-line max-lg:bg-surface max-lg:p-8 max-lg:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] max-sm:p-6">
            {children}
          </div>
        </div>

        {/* footer microcopy */}
        <div className="relative z-10 flex items-center justify-between text-xs text-faint max-lg:text-white/60 max-sm:flex-col max-sm:gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink max-lg:hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to site
          </Link>
          <span>© {new Date().getFullYear()} INSPECTRA</span>
        </div>
      </div>

      {/* dark trust panel */}
      <div className="relative overflow-hidden bg-[#06121b] text-white max-lg:hidden">
        <img
          src={SIDE_BG}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.14]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-transparent to-[#06121b]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#06121b] via-[#06121b]/40 to-transparent" />
        <div className="pointer-events-none absolute -right-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.18),transparent_65%)]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(177,134,58,0.12),transparent_65%)]" />

        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
          className="relative z-10 flex min-h-svh flex-col justify-center px-14 py-16 max-xl:px-10"
        >
          <motion.span
            variants={item}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/80"
          >
            {side.eyebrow}
          </motion.span>

          <motion.h2
            variants={item}
            className="display mt-7 text-[2.9rem] leading-[1.05] text-balance max-xl:text-4xl"
          >
            {side.headline}
          </motion.h2>

          <motion.p
            variants={item}
            className="mt-5 max-w-md text-lg leading-relaxed text-white/70"
          >
            {side.sub}
          </motion.p>

          <motion.div variants={item} className="mt-12">
            {side.proof}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
