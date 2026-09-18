import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ASSESSMENT } from "@/data/certification";
import { cn } from "@/lib/cn";

export function CertExam() {
  return (
    <section className="bg-[#06121b] py-28 text-white max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-2 items-center gap-16 max-lg:grid-cols-1 max-lg:gap-12">
          <Reveal>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#7ad4ff]">
              How you're assessed
            </span>
            <h2 className="display mt-4 text-[2.9rem] text-balance max-lg:text-4xl max-sm:text-[2rem]">
              Earned, never bought.
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/70">
              Anyone can pay for a badge. INSPECTRA grades you every week, puts you
              through a month of supervised practice, then sits you in front of an
              exam written from real transactions. By the time you are certified,
              you have proven you can do the work, not just describe it.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            {/* One column, not a 2x2 grid: at half the container width a two-up tile
                is narrower than its own heading, so "One month internship" wrapped
                to three cramped lines. */}
            <dl className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1a25]">
              {ASSESSMENT.map((a, i) => (
                <div
                  key={a.title}
                  className={cn(
                    "grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1.5 p-6 max-sm:grid-cols-1 max-sm:gap-y-2",
                    i > 0 && "border-t border-white/10",
                  )}
                >
                  <dt className="display whitespace-nowrap text-lg text-foil">{a.title}</dt>
                  <dd className="min-w-0 text-[0.9rem] leading-relaxed text-white/60">
                    {a.body}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
