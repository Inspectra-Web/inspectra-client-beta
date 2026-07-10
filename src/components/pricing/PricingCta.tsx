import { Link } from "react-router";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/landing/CtaBand";

const IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

export function PricingCta() {
  return (
    <section className="pb-32 max-lg:pb-24 max-sm:pb-16">
      <Container>
        <Reveal>
          <CtaBand image={IMAGE} className="py-24 text-center max-sm:py-16">
            <div className="mx-auto max-w-2xl">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/60">
                Start free
              </span>
              <h2 className="display mt-5 text-[3.25rem] text-white text-balance max-lg:text-4xl max-sm:text-3xl">
                Get certified, list verified, and let buyers come to you.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-base">
                Certify once, publish your first verified listings free, and upgrade the
                day you outgrow them. This is where realtors build a name buyers trust.
              </p>

              <div className="mt-9 flex items-center justify-center gap-3 max-sm:flex-col">
                <Link
                  to="/register"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] transition-transform hover:-translate-y-0.5 max-sm:w-full"
                >
                  Start free
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  to="/enablement"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10 max-sm:w-full"
                >
                  <BadgeCheck className="size-4" aria-hidden />
                  Get certified
                </Link>
              </div>

              <p className="mt-6 text-sm text-white/60">
                Free plan available · Cancel or change plans anytime
              </p>
            </div>
          </CtaBand>
        </Reveal>
      </Container>
    </section>
  );
}
