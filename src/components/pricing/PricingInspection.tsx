import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

const STEPS = [
  {
    n: "01",
    title: "Buyer pays to book",
    body: "A serious buyer pays a small inspection fee in-app to lock in a viewing. It filters out the time-wasters before they reach your calendar.",
  },
  {
    n: "02",
    title: "Held on the ledger",
    body: "The fee is recorded against the listing and you, visible to both sides. Every step of the deal has a paper trail neither party can dispute later.",
  },
  {
    n: "03",
    title: "Paid out to you",
    body: "Funds are released to you through the platform. No cash at the gate, no chasing, and each completed inspection adds to your on-record track record.",
  },
];

export function PricingInspection() {
  return (
    <section className="bg-[#06121b] py-28 text-white max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-16 max-lg:grid-cols-1 max-lg:gap-12">
          <Reveal>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#7ad4ff]">
              Inspection fees
            </span>
            <h2 className="display mt-4 text-[2.9rem] text-balance max-lg:text-4xl max-sm:text-[2rem]">
              Get paid to show, not to chase.
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/70">
              On Professional and Agency plans, buyers pay a small inspection fee
              through INSPECTRA to book a physical viewing. It is not a cost to you,
              it is a filter and a payout: only committed buyers reach your door, and
              every viewing is logged and paid on the platform.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
              Seekers browse and search for free. The inspection fee only applies when
              a buyer books a viewing.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="space-y-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-5 bg-[#0a1a25] p-7 max-sm:p-6">
                  <span className="display text-3xl text-[#38c0ff]/80 tabular-nums">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="display text-xl text-white">{s.title}</h3>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-white/60">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
