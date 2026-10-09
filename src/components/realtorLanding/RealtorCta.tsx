import { Link } from "react-router";
import { ArrowRight, Tag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/landing/CtaBand";

const IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

export function RealtorCta() {
  return (
    <section className="pb-32 max-lg:pb-24 max-sm:pb-16">
      <Container>
        <Reveal>
          <CtaBand image={IMAGE} className="py-24 text-center max-sm:py-16">
            <div className="mx-auto max-w-2xl">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/60">
                Start listing
              </span>
              <h2 className="display mt-5 text-[3.25rem] text-white text-balance max-lg:text-4xl max-sm:text-3xl">
                Your next client is looking for a verified realtor.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-base">
                Create your account, verify once, and put your listings in front
                of buyers who trust what they see.
              </p>

              <div className="mt-9 flex items-center justify-center gap-3 max-sm:flex-col">
                <Link
                  to="/register?role=realtor"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] transition-transform hover:-translate-y-0.5 max-sm:w-full"
                >
                  Create a realtor account
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10 max-sm:w-full"
                >
                  <Tag className="size-4" aria-hidden />
                  See plans
                </Link>
              </div>

              <p className="mt-6 text-sm text-white/60">
                Start free · Upgrade when your listings grow
              </p>
            </div>
          </CtaBand>
        </Reveal>
      </Container>
    </section>
  );
}
