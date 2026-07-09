import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { RealtorCard } from "@/components/RealtorCard";
import { Reveal } from "@/components/ui/Reveal";
import { realtors } from "@/data/mock";

export function CertifiedRealtors() {
  return (
    <section className="py-32 max-lg:py-24 max-sm:py-16">
      <Container>
        <div className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <SectionHeading
            eyebrow="Certified realtors"
            title="Work with agents who've earned it"
            intro="Every realtor here has passed certification and built a track record you can see: deals closed, verified listings, all on the record."
            className="max-w-2xl"
          />
          <Link to="/realtors" className={buttonClasses("outline", "md", "shrink-0")}>
            Meet all realtors
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {realtors.map((realtor, i) => (
            <Reveal key={realtor.id} delay={(i % 3) * 0.08}>
              <RealtorCard realtor={realtor} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
