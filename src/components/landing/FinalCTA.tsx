import { Link } from "react-router";
import { ArrowRight, Search, Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-deep to-brand px-6 py-16 text-center shadow-xl sm:px-12">
          {/* soft light bloom */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance text-white sm:text-4xl md:text-5xl">
              Start your search with confidence.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85">
              Find a home that's already verified, or list your property to buyers who
              trust what they see. It starts here.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/listings"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Search className="size-4" aria-hidden />
                Browse verified homes
              </Link>
              <Link
                to="/register"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/40 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Building2 className="size-4" aria-hidden />
                List your property
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Free for home seekers · No listing goes live unverified
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
