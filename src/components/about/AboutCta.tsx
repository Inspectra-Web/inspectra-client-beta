import { ArrowRight, Home, BadgeCheck } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";
import { CtaBand } from "@/components/landing/CtaBand";

const CTA_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

export function AboutCta() {
  return (
    <section className="pb-28 max-lg:pb-20 max-sm:pb-16">
      <Container>
        <CtaBand image={CTA_IMAGE}>
          <div className="mx-auto max-w-2xl text-center text-white">
            <h2 className="display text-[2.6rem] leading-tight text-balance max-lg:text-4xl max-sm:text-[1.9rem]">
              Whether you're buying or selling, start with trust.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/70 max-sm:text-base">
              Browse homes that are verified before they list, or get certified and sell
              on the platform buyers already trust.
            </p>
          </div>

          <div className="mx-auto mt-9 flex max-w-xl items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch">
            <Link
              to="/listings"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
            >
              <Home className="size-4" aria-hidden />
              Browse verified listings
            </Link>
            <Link
              to="/enablement"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 max-sm:h-12"
            >
              <BadgeCheck className="size-4" aria-hidden />
              Get certified
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </CtaBand>
      </Container>
    </section>
  );
}
