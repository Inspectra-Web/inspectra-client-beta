import { RealtorHero } from "@/components/realtorLanding/RealtorHero";
import { RealtorValue } from "@/components/realtorLanding/RealtorValue";
import { RealtorSteps } from "@/components/realtorLanding/RealtorSteps";
import { RealtorCta } from "@/components/realtorLanding/RealtorCta";
import { TokenRewards } from "@/components/landing/TokenRewards";
import { ForRealtors } from "@/components/landing/ForRealtors";

export function RealtorLanding() {
  return (
    <>
      <RealtorHero />
      <RealtorValue />
      <RealtorSteps />
      <TokenRewards audience="realtor" />
      <ForRealtors />
      <RealtorCta />
    </>
  );
}
