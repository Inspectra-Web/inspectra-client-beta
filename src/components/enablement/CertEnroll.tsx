import { Check, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CERT_TRACKS, CERT_DISCOUNTS } from "@/data/certification";
import { formatPriceFull } from "@/lib/format";

const INCLUDED = [
  "All thirteen subjects, taught by practitioners",
  "Study materials on registration",
  "Weekly assessments and a one month internship",
  "The certification exam",
  "Certified badge on your profile and listings",
  "Workshops and webinars after you qualify",
];

export function CertEnroll() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-2 items-center gap-14 max-lg:grid-cols-1 max-lg:gap-10">
          {/* copy */}
          <Reveal>
            <span className="eyebrow">Enrollment</span>
            <h2 className="display mt-4 text-[2.9rem] text-balance max-lg:text-4xl max-sm:text-[2rem]">
              One certification. Two ways to earn it.
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
              Full-time runs through the week, Executive at weekends. Same curriculum,
              same exam, same credential.
            </p>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted">
              Register early for {CERT_DISCOUNTS.early}% off, or {CERT_DISCOUNTS.bulk}%
              for organizations enrolling a team.
            </p>
          </Reveal>

          {/* price card: the one place the foil ring appears off-hero */}
          <Reveal delay={0.1} className="relative">
            <div className="absolute -inset-px rounded-[1.4rem] bg-foil opacity-60" aria-hidden />
            <div className="relative rounded-[1.35rem] border border-line bg-surface p-8 shadow-[0_30px_70px_-40px_rgba(10,38,54,0.5)] max-sm:p-7">
              <div className="flex items-center justify-between">
                <span className="credential-meta text-[0.62rem] text-foil">
                  Certification program
                </span>
                <span className="rounded-full bg-brand/12 px-2.5 py-1 text-[0.7rem] font-semibold text-brand-ink">
                  Fully online
                </span>
              </div>

              <dl className="mt-6 divide-y divide-line border-y border-line">
                {CERT_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-baseline justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <dt className="display text-xl">{track.name}</dt>
                      <p className="credential-meta mt-1 text-[0.6rem] text-faint">
                        {track.schedule}
                      </p>
                    </div>
                    <dd className="display shrink-0 text-3xl max-sm:text-2xl">
                      {formatPriceFull(track.fee)}
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-7 space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink/85">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-verified/15">
                      <Check className="size-3 text-verified" strokeWidth={3.5} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* A status line, not a button: enrollment is not open yet, so nothing
                  here should look like it takes payment. */}
              <p className="mt-8 flex items-center justify-center gap-2 rounded-full border border-line bg-surface-2/60 px-7 py-3.5 text-sm font-medium text-muted">
                <Clock className="size-4 shrink-0 text-foil" aria-hidden />
                Enrollment opens soon
              </p>
              <p className="mt-3 text-center text-xs text-faint">
                One payment for the program. No subscription, no hidden fees.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
