import { Clock, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const MODULES = [
  {
    n: "01",
    title: "Title & documents",
    body: "Read and validate a Certificate of Occupancy, Governor's Consent, deed of assignment and survey plan, and spot the red flags before a buyer does.",
    lessons: 5,
    minutes: 90,
  },
  {
    n: "02",
    title: "Land use & the registry",
    body: "How the Land Use Act, state land registries and encumbrances decide who really owns a property, and how to confirm it.",
    lessons: 4,
    minutes: 70,
  },
  {
    n: "03",
    title: "Fee disclosure & ethics",
    body: "Itemize every fee upfront, set fair commission terms, and hold to the conduct standard buyers are promised on INSPECTRA.",
    lessons: 4,
    minutes: 60,
  },
  {
    n: "04",
    title: "Valuation & market reading",
    body: "Price a listing by area with real comparables, read demand honestly, and negotiate in good faith on both sides.",
    lessons: 5,
    minutes: 80,
  },
  {
    n: "05",
    title: "Remote & diaspora buyers",
    body: "Run virtual tours and live walkthroughs, and guide a buyer deciding from abroad all the way to a confident close.",
    lessons: 4,
    minutes: 65,
  },
  {
    n: "06",
    title: "Disputes & accountability",
    body: "Handle flags calmly, keep a clean transaction record, and resolve issues on-platform before they become disputes.",
    lessons: 3,
    minutes: 45,
  },
];

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
