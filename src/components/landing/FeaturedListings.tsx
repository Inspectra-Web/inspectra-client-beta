import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { usePublicListings, toCardListing, EMPTY_QUERY } from "@/lib/marketplace";

export function FeaturedListings() {
  // The browse page's own resting query, asking for a strip's worth: "recommended"
  // is verified-first, so what leads the landing page is what cleared its checks.
  const { data, isPending } = usePublicListings(EMPTY_QUERY, 6);
  const listings = data?.listings ?? [];

  // Nothing to feature is not an empty band: the section stands down entirely.
  if (!isPending && listings.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface-2/40 py-20 max-lg:py-16 max-sm:py-12">
      <Container>
        <div className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <SectionHeading
            eyebrow="Live on INSPECTRA"
            title="Homes worth moving for"
            intro="Every listing carries its document and title check in plain sight. Explore a few that just went live."
            className="max-w-2xl"
          />
          <Link to="/listings" className={buttonClasses("outline", "md", "shrink-0")}>
            Browse all listings
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {isPending
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i}>
                  <div className="aspect-[10/9] animate-pulse rounded-2xl bg-surface-2" />
                  <div className="space-y-2 pt-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                  </div>
                </div>
              ))
            : listings.map((listing, i) => (
                <Reveal key={listing.id} delay={(i % 3) * 0.08}>
                  <PropertyCard listing={toCardListing(listing)} />
                </Reveal>
              ))}
        </div>
      </Container>
    </section>
  );
}
