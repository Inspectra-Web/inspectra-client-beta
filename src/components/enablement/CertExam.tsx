import { Fragment } from "react";
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
              Anyone can pay for a badge. Here you are graded every week, put through
              a month of supervised practice, then examined on real transactions.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            {/* One column, not a 2x2 grid: at half the container width a two-up tile
                is narrower than its own heading, so "One month internship" wrapped
                to three cramped lines.
                The rows share ONE grid rather than each being its own: a per-row
                grid sizes its `auto` track to that row's own term, so every
                description started at a different x. */}
            <dl className="grid grid-cols-[auto_1fr] items-baseline overflow-hidden rounded-2xl border border-white/10 bg-[#0a1a25] max-sm:grid-cols-1">
              {ASSESSMENT.map((a, i) => (
                <Fragment key={a.title}>
                  <dt
                    className={cn(
                      "display whitespace-nowrap py-6 pl-6 pr-5 text-lg text-foil max-sm:pb-1.5 max-sm:pr-6",
                      i > 0 && "border-t border-white/10 max-sm:pt-6",
                    )}
                  >
                    {a.title}
                  </dt>
                  <dd
                    className={cn(
                      "min-w-0 py-6 pr-6 text-[0.9rem] leading-relaxed text-white/60 max-sm:pl-6 max-sm:pt-0",
                      i > 0 && "border-t border-white/10 max-sm:border-t-0",
                    )}
                  >
                    {a.body}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
