import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import hxafrica from "@/assets/partners/hxafrica.svg";
import lambacard from "@/assets/partners/lambacard.png";
import naijaland from "@/assets/partners/naijaland.png";
import realtorsFirst from "@/assets/partners/realtorsfirst-trimmed.png";

// `size` lifts a stacked mark that reads small at the one-line wordmarks' height.
const PARTNERS: { name: string; logo: string; size?: string }[] = [
  { name: "HXafrica", logo: hxafrica },
  { name: "Naijaland", logo: naijaland },
  { name: "RealtorsFirst", logo: realtorsFirst },
  { name: "LambaCard", logo: lambacard, size: "max-h-14 max-sm:max-h-12" },
];

const logoCls = "max-h-10 w-auto max-w-full object-contain max-sm:max-h-9";

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

        <div className="mt-14 grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:mt-10 max-sm:grid-cols-1">
          {PARTNERS.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 0.07}
              className="grid h-28 place-items-center rounded-2xl bg-white px-8 max-sm:h-24 max-sm:px-6"
            >
              {/* Logos keep their own colours in both themes, so the tile stays white:
                  their dark ink would sink into a dark one. */}
              <img src={p.logo} alt={p.name} className={cn(logoCls, p.size)} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
