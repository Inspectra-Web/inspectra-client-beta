import { ArrowDown, MessagesSquare, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const GAINS: { label: string; Icon: LucideIcon }[] = [
  { label: "One-on-one guidance on your own listings", Icon: MessagesSquare },
  { label: "Stories that travel further than an ad", Icon: Sparkles },
  { label: "More enquiries that turn into sales", Icon: TrendingUp },
];

/** The launch offer: mentorship paid for by INSPECTRA for the first hundred realtors. */
export function CourseMentorship() {
  return (
    <section className="relative overflow-hidden bg-[#06121b] py-28 max-lg:py-20 max-sm:py-16">
      <div
        aria-hidden
        className="absolute -right-40 top-1/2 size-[36rem] -translate-y-1/2 rounded-full bg-brand/15 blur-3xl"
      />

      <Container className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-16 max-lg:grid-cols-1 max-lg:gap-12">
        <Reveal y={16}>
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#38c0ff]">
            Launch offer
          </span>
          <h2 className="display mt-4 text-[2.9rem] leading-[1.08] text-white text-balance max-lg:text-4xl max-sm:text-[2rem]">
            Be amongst the first to enjoy mentorship after your masterclasses
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/70">
            Be one of the first 100 realtors to get your Advanced AI Storytelling mentorship fully
            paid for by INSPECTRA, and start closing more sales.
          </p>

          <ul className="mt-9 space-y-4">
            {GAINS.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3 text-white/90">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[#38c0ff] ring-1 ring-white/15">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <a
            href="#enrol"
            className="mt-10 inline-flex h-13 items-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
          >
            Claim your place
            <ArrowDown className="size-4" aria-hidden />
          </a>
        </Reveal>

        <Reveal y={16} delay={0.08}>
          <div className="relative rounded-3xl border border-white/15 bg-white/5 p-10 text-center backdrop-blur-sm max-sm:p-8">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/60">
              Fully paid for
            </p>
            <p className="display mt-3 text-[8rem] leading-none tracking-[-0.05em] text-white max-sm:text-[6rem]">
              100
            </p>
            <p className="mt-2 text-lg font-semibold text-white">realtors only</p>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Places go in the order realtors enrol. When the hundredth is taken, the offer closes.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
