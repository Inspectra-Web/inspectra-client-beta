import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonial() {
  return (
    <section className="py-32 max-lg:py-24 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-14 max-lg:grid-cols-1 max-lg:gap-10">
          {/* portrait */}
          <Reveal className="relative overflow-hidden rounded-2xl border border-line max-lg:mx-auto max-lg:max-w-sm">
            <img
              src="https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80"
              alt="Chidi Nwosu"
              className="aspect-[4/5] w-full object-cover object-[center_20%] max-lg:aspect-[16/10]"
            />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
              <BadgeCheck className="size-4 text-emerald-600" aria-hidden />
              Verified purchase
            </span>
          </Reveal>

          {/* quote */}
          <Reveal delay={0.12}>
            <span className="eyebrow">What buyers say</span>
            <blockquote className="display mt-6 text-[2.4rem] leading-[1.15] text-balance max-lg:text-3xl max-sm:text-[1.7rem]">
              “I was about to pay for a duplex in Lekki when INSPECTRA flagged a title
              problem the agent never mentioned. It saved me from a disaster, and I found a
              verified home two weeks later.”
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?auto=format&fit=facearea&facepad=3&w=88&h=88&q=80"
                alt=""
                className="size-11 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-ink">Chidi Nwosu</p>
                <p className="text-sm text-muted">Bought a home in Lekki, Lagos</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
