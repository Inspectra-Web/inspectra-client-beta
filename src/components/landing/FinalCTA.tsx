import { Link } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/landing/CtaBand";

const IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80";

export function FinalCTA() {
  return (
    <section className="pb-32 max-lg:pb-24 max-sm:pb-16">
      <Container>
        <Reveal>
          <CtaBand image={IMAGE} className="py-24 text-center max-sm:py-16">
            <div className="mx-auto max-w-2xl">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/60">
              Start your search
            </span>
            <h2 className="display mt-5 text-[3.25rem] text-white text-balance max-lg:text-4xl max-sm:text-3xl">
              Your next home is already verified. Come find it.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-base">
              Search homes you can trust, or list your property to buyers who trust what
              they see. It starts here.
            </p>

            <div className="mt-9 flex items-center justify-center gap-3 max-sm:flex-col">
              <Link
                to="/listings"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] transition-transform hover:-translate-y-0.5 max-sm:w-full"
              >
                <Search className="size-4" aria-hidden />
                Browse verified homes
              </Link>
              <Link
                to="/register"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10 max-sm:w-full"
              >
                List your property
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/60">
              Free for home seekers · No listing goes live unverified
            </p>
          </div>
          </CtaBand>
        </Reveal>
      </Container>
    </section>
  );
}
