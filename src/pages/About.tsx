import { AboutHero } from "@/components/about/AboutHero";
import { AboutMission } from "@/components/about/AboutMission";
import { AboutProblem } from "@/components/about/AboutProblem";
import { AboutVision } from "@/components/about/AboutVision";
import { AboutTeam } from "@/components/about/AboutTeam";
import { AboutCta } from "@/components/about/AboutCta";

export function About() {
  return (
    <>
      <AboutHero />
      <AboutMission />
      <AboutProblem />
      <AboutVision />
      <AboutTeam />
      <AboutCta />
    </>
  );
}
