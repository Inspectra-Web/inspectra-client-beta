import { Link } from "react-router";
import { ArrowLeft, MapPinOff, Search } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import logoWhite from "@/assets/inspectra-logo-white-lg.png";

// Architectural backdrop, kept present but dimmed so the copy stays legible.
const BG_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

// Familiar destinations, so a dead link is never a dead end.
const QUICK_LINKS = [
  { label: "Browse listings", to: "/listings" },
  { label: "Find realtors", to: "/realtors" },
  { label: "Get certified", to: "/enablement" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

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

/** Standalone 404: a full-bleed dark hero with no global header/footer (see router). */
export function NotFound() {
  const reduced = useReducedMotion();

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#06121b] text-white">
      {/* architectural backdrop + legibility washes */}
      <img
        src={BG_IMAGE}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-[#06121b]/70 to-[#06121b]" />
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(177,134,58,0.12),transparent_65%)]" />

      {/* minimal top bar: just the logo home */}
      <div className="relative z-10 px-10 py-8 max-lg:px-6 max-sm:px-5">
        <Link to="/" className="inline-flex items-center" aria-label="INSPECTRA home">
          <img src={logoWhite} alt="INSPECTRA" className="h-9 w-auto" />
        </Link>
      </div>

      {/* centered content */}
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
          <MapPinOff className="size-3.5 text-[#38c0ff]" aria-hidden />
          Error 404
        </motion.span>

        <motion.p
          variants={item}
          aria-hidden
          className="display mt-8 select-none text-[12rem] leading-none text-brand-gradient max-lg:text-[9rem] max-sm:text-[6.5rem]"
        >
          404
        </motion.p>

        <motion.h1
          variants={item}
          className="display mt-4 text-[2.9rem] leading-[1.05] text-balance max-lg:text-4xl max-sm:text-3xl"
        >
          We couldn't verify that address.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-md text-lg leading-relaxed text-white/70 max-sm:text-base"
        >
          The page you're looking for may have moved or never existed. Everything on
          INSPECTRA is still just a click away.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-stretch"
        >
          <Link
            to="/"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to home
          </Link>
          <Link
            to="/listings"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 max-sm:h-12"
          >
            <Search className="size-4" aria-hidden />
            Browse verified listings
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 w-full max-w-lg border-t border-white/10 pt-8"
        >
          <p className="text-sm font-medium text-white/45">Or head somewhere useful</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
