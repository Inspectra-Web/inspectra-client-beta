import { Clock, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CERT_MODULES as MODULES } from "@/data/certification";

export function CertSyllabus() {
  return (
    <section id="syllabus" className="scroll-mt-20 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="The syllabus"
          title="Six modules, built for this market"
          intro="Not generic sales theory. It's the exact ground a Nigerian realtor has to hold to sell property buyers can trust."
        />

        <div className="mt-16 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:mt-12 max-sm:grid-cols-1">
          {MODULES.map((m, i) => (
            <Reveal
              key={m.n}
              delay={(i % 3) * 0.07}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_36px_-24px_rgba(10,30,45,0.18)] max-sm:p-6"
            >
              <span className="display text-4xl text-ink/15 transition-colors group-hover:text-brand/40">
                {m.n}
              </span>
              <h3 className="display mt-3 text-xl">{m.title}</h3>
              <p className="mt-2.5 grow text-[0.95rem] leading-relaxed text-muted">
                {m.body}
              </p>
              <div className="credential-meta mt-6 flex items-center gap-4 border-t border-line pt-4 text-[0.62rem] text-faint">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="size-3.5" aria-hidden />
                  {m.lessons} lessons
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden />
                  {m.minutes} min
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
