import { Hero } from "@/components/landing/Hero";
import { Solutions } from "@/components/landing/Solutions";
import { TrustLayers } from "@/components/landing/TrustLayers";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedListings } from "@/components/landing/FeaturedListings";
import { Testimonial } from "@/components/landing/Testimonial";
import { CertifiedRealtors } from "@/components/landing/CertifiedRealtors";
import { ForRealtors } from "@/components/landing/ForRealtors";
import { FinalCTA } from "@/components/landing/FinalCTA";

export function Landing() {
  return (
    <>
      <Hero />
      <Solutions />
      <TrustLayers />
      <HowItWorks />
      <FeaturedListings />
      <Testimonial />
      <CertifiedRealtors />
      <ForRealtors />
      <FinalCTA />
    </>
  );
}
