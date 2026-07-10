import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function CertProof() {
  return (
    <section className="bg-surface-2/50 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-[1.15fr_0.85fr] items-center gap-14 max-lg:grid-cols-1 max-lg:gap-10">
          {/* quote */}
          <Reveal className="max-lg:order-2">
            <span className="eyebrow">From a certified realtor</span>
            <blockquote className="display mt-6 text-[2.4rem] leading-[1.15] text-balance max-lg:text-3xl max-sm:text-[1.7rem]">
              “The day I got certified, the serious enquiries started. Buyers who
              used to go quiet now book an inspection the same afternoon, because
              certification tells them I'm worth their time.”
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=3&w=88&h=88&q=80"
                alt=""
                className="size-11 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-ink">Emeka Balogun</p>
                <p className="credential-meta text-[0.6rem] text-faint">
                  Certified Realtor · Abuja · INS-CR-2026-0311
                </p>
              </div>
            </div>
          </Reveal>

          {/* portrait with the badge on a real photo */}
          <Reveal
            delay={0.12}
            className="relative overflow-hidden rounded-2xl border border-line max-lg:order-1 max-lg:mx-auto max-lg:max-w-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80"
              alt="Emeka Balogun, a certified INSPECTRA realtor"
              className="aspect-[4/5] w-full object-cover object-[center_25%] max-lg:aspect-[16/10]"
            />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-black/5">
              <span className="grid size-5 place-items-center rounded-full bg-foil">
                <BadgeCheck className="size-3.5 text-[#06121b]" strokeWidth={2.75} aria-hidden />
              </span>
              <span className="text-xs font-bold text-slate-900">Certified Realtor</span>
            </span>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
