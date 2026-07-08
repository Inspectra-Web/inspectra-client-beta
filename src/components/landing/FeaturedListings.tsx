import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/data/mock";

export function FeaturedListings() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Verified listings"
            title="Homes ranked by proof, not by boost"
            intro="Sorted by verification status and trust — so the most trustworthy homes rise to the top, every time."
            className="max-w-2xl"
          />
          <Link
            to="/listings"
            className={buttonClasses("outline", "md", "shrink-0")}
          >
            Browse all listings
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Container>
    </section>
  );
}
