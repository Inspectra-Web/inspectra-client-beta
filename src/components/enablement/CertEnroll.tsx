import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const INCLUDED = [
  "Six training modules, self-paced (~8 hours)",
  "The timed certification exam",
  "Two free retakes if you need them",
  "Certified badge on your profile and every listing",
  "A verifiable credential, valid for two years",
  "Priority standing in buyer search",
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
              One fee. One exam. Certified for two years.
            </h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
              No subscription to stay certified and no fee to pass. You pay once
              to enroll, and the credential is yours for two full years, renewed
              with a short refresher when it's time.
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
                  Required to list
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="display text-6xl max-sm:text-5xl">₦75,000</span>
                <span className="text-sm text-muted">one-time</span>
              </div>

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

              <Link
                to="/register"
                className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
              >
                Start certification
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <p className="mt-3 text-center text-xs text-faint">
                Pay once. No subscription, no hidden fees.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
