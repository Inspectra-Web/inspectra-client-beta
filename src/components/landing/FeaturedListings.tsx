import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { properties } from "@/data/mock";

export function FeaturedListings() {
  return (
    <section className="border-y border-line bg-surface-2/40 py-20 max-lg:py-16 max-sm:py-12">
      <Container>
        <div className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <SectionHeading
            eyebrow="Live on INSPECTRA"
            title="Homes worth moving for"
            intro="Every listing has passed document and title checks before it appears. Explore a few that just went live."
            className="max-w-2xl"
          />
          <Link to="/listings" className={buttonClasses("outline", "md", "shrink-0")}>
            Browse all listings
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {properties.map((property, i) => (
            <Reveal key={property.id} delay={(i % 3) * 0.08}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
