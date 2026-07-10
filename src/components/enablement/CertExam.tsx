import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

const STATS = [
  { value: "75%", label: "Pass mark" },
  { value: "60", label: "Minutes, timed" },
  { value: "40", label: "Questions" },
  { value: "2", label: "Free retakes" },
];

export function CertExam() {
  return (
    <section className="bg-[#06121b] py-28 text-white max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-2 items-center gap-16 max-lg:grid-cols-1 max-lg:gap-12">
          <Reveal>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#7ad4ff]">
              The exam
            </span>
            <h2 className="display mt-4 text-[2.9rem] text-balance max-lg:text-4xl max-sm:text-[2rem]">
              Earned, never bought.
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/70">
              Anyone can pay for a badge. On INSPECTRA, getting certified comes
              down to one timed exam across the full syllabus, so a Certified
              realtor has actually proven they know how to sell property a buyer
              can trust. That's what makes the credential worth carrying.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {STATS.map((s) => (
                <div key={s.label} className="bg-[#0a1a25] p-8 max-sm:p-6">
                  <dt className="display text-5xl text-foil max-sm:text-4xl">
                    {s.value}
                  </dt>
                  <dd className="credential-meta mt-3 text-[0.62rem] text-white/55">
                    {s.label}
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
