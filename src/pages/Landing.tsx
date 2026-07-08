import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Solutions } from "@/components/landing/Solutions";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustLayers } from "@/components/landing/TrustLayers";
import { CertifiedRealtors } from "@/components/landing/CertifiedRealtors";
import { FeaturedListings } from "@/components/landing/FeaturedListings";
import { FinalCTA } from "@/components/landing/FinalCTA";

export function Landing() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Solutions />
      <HowItWorks />
      <TrustLayers />
      <CertifiedRealtors />
      <FeaturedListings />
      <FinalCTA />
    </>
  );
}
