import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { RealtorCard } from "@/components/RealtorCard";
import { realtors } from "@/data/mock";

export function CertifiedRealtors() {
  return (
    <section className="border-t border-line bg-surface-2/40 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Certified realtors"
            title="Work with agents who've earned it"
            intro="Every realtor here has passed certification and built a track record you can see — trust score, deals closed, disputes and all."
            className="max-w-2xl"
          />
          <Link to="/realtors" className={buttonClasses("outline", "md", "shrink-0")}>
            Meet all realtors
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {realtors.map((realtor) => (
            <RealtorCard key={realtor.id} realtor={realtor} />
          ))}
        </div>
      </Container>
    </section>
  );
}
