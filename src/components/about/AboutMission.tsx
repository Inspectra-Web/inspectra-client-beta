import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

export function AboutMission() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <div className="grid grid-cols-[0.9fr_1.1fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-8">
          <Reveal>
            <span className="eyebrow">Our mission</span>
            <h2 className="display mt-4 text-[2.9rem] text-balance max-lg:text-4xl max-sm:text-[2rem]">
              Move trust from the salesperson to the asset.
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="space-y-6 text-[1.08rem] leading-relaxed text-muted max-sm:text-base">
            <p>
              For years, deciding whether a Nigerian property was real meant deciding
              whether you believed the agent in front of you. The document could be
              forged, the title disputed, the same plot sold twice, and you would only
              find out after the money moved.
            </p>
            <p>
              INSPECTRA exists to end that. We check the paperwork and match the title
              before a listing goes live, disclose every fee upfront, and certify the
              realtors who sell on the platform. The listing you see is one you can act
              on, because the proof sits on the asset, not on a stranger's word.
            </p>
            <p className="text-ink font-medium">
              Fewer surprises. Fewer disputes. A market where a verified home means
              exactly that.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
