import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingWhy } from "@/components/pricing/PricingWhy";
import { PricingTiers } from "@/components/pricing/PricingTiers";
import { PricingCertification } from "@/components/pricing/PricingCertification";
import { PricingInspection } from "@/components/pricing/PricingInspection";
import { PricingCompare } from "@/components/pricing/PricingCompare";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { PricingCta } from "@/components/pricing/PricingCta";

export function Pricing() {
  return (
    <>
      <PricingHero />
      <PricingWhy />
      <PricingTiers />
      <PricingCertification />
      <PricingInspection />
      <PricingCompare />
      <PricingFaq />
      <PricingCta />
    </>
  );
}
