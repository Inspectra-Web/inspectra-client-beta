import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingWhy } from "@/components/pricing/PricingWhy";
import { PricingTiers } from "@/components/pricing/PricingTiers";
import { PricingCertification } from "@/components/pricing/PricingCertification";
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
      <PricingCompare />
      <PricingFaq />
      <PricingCta />
    </>
  );
}
