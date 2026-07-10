import { AboutHero } from "@/components/about/AboutHero";
import { AboutMission } from "@/components/about/AboutMission";
import { AboutProblem } from "@/components/about/AboutProblem";
import { AboutApproach } from "@/components/about/AboutApproach";
import { AboutTeam } from "@/components/about/AboutTeam";
import { AboutVision } from "@/components/about/AboutVision";
import { AboutCta } from "@/components/about/AboutCta";

export function About() {
  return (
    <>
      <AboutHero />
      <AboutMission />
      <AboutProblem />
      <AboutApproach />
      <AboutTeam />
      <AboutVision />
      <AboutCta />
    </>
  );
}
