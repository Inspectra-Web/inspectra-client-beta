import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import hxafrica from "@/assets/partners/hxafrica.svg";
import naijaland from "@/assets/partners/naijaland.png";
import realtorsFirst from "@/assets/partners/realtorsfirst-trimmed.png";

const PARTNERS: { name: string; logo: string }[] = [
  { name: "HXafrica", logo: hxafrica },
  { name: "Naijaland", logo: naijaland },
  { name: "RealtorsFirst", logo: realtorsFirst },
];

export function Partners() {
  return (
    <section className="bg-surface-2/40 py-24 max-lg:py-20 max-sm:py-14">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Our partners"
          title="The people we build alongside"
          intro="The organizations working with INSPECTRA as verified property becomes the norm in Nigeria."
        />

        <div className="mt-14 grid grid-cols-3 gap-6 max-sm:mt-10 max-sm:grid-cols-1">
          {PARTNERS.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 0.07}
              className="grid h-28 place-items-center rounded-2xl bg-surface px-8 max-sm:h-24 max-sm:px-6"
            >
              {/* The wordmarks carry dark ink that would sink into the dark canvas,
                  so the dark theme renders them as flat white. */}
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-10 w-auto max-w-full object-contain max-sm:max-h-9 dark:brightness-0 dark:invert"
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
