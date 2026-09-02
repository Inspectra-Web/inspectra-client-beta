import { Link } from "react-router";
import { ArrowLeft, LayoutDashboard, ShieldAlert } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import logoWhite from "@/assets/inspectra-logo-white-lg.png";
import { homeFor, useAuthUser } from "@/lib/auth";

// Same architectural backdrop as the 404, kept dim so the copy stays legible.
const BG_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

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

/**
 * Standalone 403, rendered in place by RequireAuth when a signed-in user opens an
 * area their role does not own. Rendering (not redirecting) keeps the URL, so the
 * refusal is visible rather than silent.
 */
export function Unauthorized() {
  const reduced = useReducedMotion();
  const user = useAuthUser();

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#06121b] text-white">
      <img
        src={BG_IMAGE}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-[#06121b]/70 to-[#06121b]" />
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(177,134,58,0.12),transparent_65%)]" />

      <div className="relative z-10 px-10 py-8 max-lg:px-6 max-sm:px-5">
        <Link to="/" className="inline-flex items-center" aria-label="INSPECTRA home">
          <img src={logoWhite} alt="INSPECTRA" className="h-9 w-auto" />
        </Link>
      </div>

      <motion.div
        variants={container}
        initial={reduced ? false : "hidden"}
        animate="show"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/80"
        >
          <ShieldAlert className="size-3.5 text-[#38c0ff]" aria-hidden />
          Error 403
        </motion.span>

        <motion.p
          variants={item}
          aria-hidden
          className="display mt-8 select-none text-[12rem] leading-none text-brand-gradient max-lg:text-[9rem] max-sm:text-[6.5rem]"
        >
          403
        </motion.p>

        <motion.h1
          variants={item}
          className="display mt-4 text-[2.9rem] leading-[1.05] text-balance max-lg:text-4xl max-sm:text-3xl"
        >
          That area isn't yours to open.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-md text-lg leading-relaxed text-white/70 max-sm:text-base"
        >
          You're signed in, but this part of INSPECTRA belongs to a different kind of
          account. Your own workspace is one click away.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-stretch"
        >
          <Link
            to={homeFor(user.role)}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
          >
            <LayoutDashboard className="size-4" aria-hidden />
            Go to your dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 max-sm:h-12"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
