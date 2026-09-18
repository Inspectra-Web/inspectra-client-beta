import { Link } from "react-router";
import { ArrowRight, BadgeCheck, Check, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const INCLUDED = [
  "Thirteen Nigeria-specific subjects",
  "Weekly assessments and a one month internship",
  "One scenario-based certification exam",
  "Certified badge on your profile and listings",
];

// Certification is not built yet and is not a gate on listing: a realtor verifies their
// identity, subscribes and publishes without it. This band previews the program rather
// than selling it, so nothing here offers a purchase the platform cannot complete.

export function PricingCertification() {
  return (
    <section className="bg-surface-2/50 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-2 items-center gap-14 max-lg:grid-cols-1 max-lg:gap-10">
          {/* copy */}
          <Reveal>
            <span className="eyebrow">Coming soon</span>
            <h2 className="display mt-4 text-[2.9rem] text-balance max-lg:text-4xl max-sm:text-[2rem]">
              Certification is on the way.
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
              You do not need it to list. Verify your identity, pick a plan and publish
              today. Certification is a separate program we run online: a Nigeria-specific
              curriculum and exam that will qualify you as a Certified Real Estate
              Practitioner of Nigeria and put the credential on your profile, for the
              realtors who want to prove the depth behind their work.
            </p>
            <Link
              to="/enablement"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:underline"
            >
              See what it will cover
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>

          {/* credential card: the one foil moment on this page */}
          <Reveal delay={0.1} className="relative">
            <div className="absolute -inset-px rounded-[1.4rem] bg-foil opacity-50" aria-hidden />
            <div className="relative rounded-[1.35rem] border border-line bg-surface p-8 shadow-[0_30px_70px_-40px_rgba(10,38,54,0.5)] max-sm:p-7">
              <div className="flex items-center justify-between">
                <span className="credential-meta text-[0.62rem] text-foil">
                  Certification program
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-foil">
                  <BadgeCheck className="size-4.5 text-[#06121b]" strokeWidth={2.5} aria-hidden />
                </span>
              </div>

              <p className="mt-5 display text-2xl">What it will include.</p>

              <ul className="mt-6 space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink/85">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-verified/15">
                      <Check className="size-3 text-verified" strokeWidth={3.5} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* A status line, not a button: enrolment does not exist yet, so nothing
                  here should look like it takes payment. */}
              <p className="mt-8 flex items-center justify-center gap-2 rounded-full border border-line bg-surface-2/60 px-7 py-3.5 text-sm font-medium text-muted">
                <Clock className="size-4 shrink-0 text-foil" aria-hidden />
                Enrolment opens soon
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
