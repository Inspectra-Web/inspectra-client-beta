import { Link } from "react-router";
import { CalendarCheck, Clock, Coins, Flame, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: CalendarCheck,
    title: "Book an inspection",
    body: "Pay for your viewing securely in-app, as you normally would.",
  },
  {
    icon: Coins,
    title: "Claim your crypto",
    body: "Cashback lands instantly, every time you pay.",
  },
  {
    icon: Flame,
    title: "Tokens are burned",
    body: "Every reward burns tokens, shrinking the total supply.",
  },
];

export function TokenRewards() {
  return (
    <section className="pb-32 max-lg:pb-24 max-sm:pb-16">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl bg-[#06121b]">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -bottom-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl"
          />
          <div className="relative grid grid-cols-2 items-center gap-14 p-14 max-lg:grid-cols-1 max-lg:gap-10 max-lg:p-10 max-sm:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brand">
                  Token rewards
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                  <Clock className="size-3" strokeWidth={2.5} aria-hidden />
                  Coming soon
                </span>
              </div>
              <h2 className="display mt-4 text-[2.6rem] text-white text-balance max-lg:text-4xl max-sm:text-3xl">
                Earn crypto while you find your next home
              </h2>
              <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/70">
                Get instant crypto cashback every time you pay for an inspection
                on INSPECTRA. We burn tokens with every reward given, reducing
                the total supply to protect your asset's value.
              </p>
              <p className="mt-5 max-w-md text-[1.05rem] italic text-white/90">
                Book your inspection, claim your crypto, and grow your wealth
                while you search.
              </p>

              <Link
                to="/listings"
                className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-semibold text-[#04121f] transition-transform hover:-translate-y-0.5"
              >
                <Search className="size-4" aria-hidden />
                Browse verified homes
              </Link>
            </div>

            <ol className="relative space-y-3">
              <span
                aria-hidden
                className="absolute bottom-10 left-[2.15rem] top-10 w-px bg-gradient-to-b from-brand/60 via-brand/30 to-transparent"
              />
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li
                  key={title}
                  className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand ring-4 ring-[#06121b]">
                    <Icon className="size-4.5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                      Step 0{i + 1}
                    </p>
                    <p className="display mt-0.5 text-lg text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-white/60">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
