import { BadgeCheck, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STAKES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: BadgeCheck,
    title: "Trusted on sight",
    body: "The Certified badge sits on your profile and every listing you publish. Serious buyers look for it before they look at anything else.",
  },
  {
    Icon: TrendingUp,
    title: "Ranked above the noise",
    body: "Certified realtors and their verified listings surface first. Standing earned through your work decides your place, not who paid to appear.",
  },
  {
    Icon: Globe,
    title: "Ready for diaspora buyers",
    body: "Learn the remote-ready tools, from virtual tours to live walkthroughs, and close with buyers deciding from abroad.",
  },
  {
    Icon: ShieldCheck,
    title: "A reputation you own",
    body: "One portable, verifiable credential you carry into every deal, backed by INSPECTRA and recognized by every buyer on the platform.",
  },
];

export function CertStakes() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Why it's worth it"
          title="What certification does for you"
          intro="Getting certified is the standard to list on INSPECTRA. It's also the fastest way to be taken seriously by the buyers who used to walk away."
        />

        <div className="mt-16 grid grid-cols-2 gap-5 max-sm:mt-12 max-sm:grid-cols-1">
          {STAKES.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.07}
              className="flex flex-col rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-brand/40 max-sm:p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand/12">
                <s.Icon className="size-5.5 text-brand-ink" strokeWidth={2} aria-hidden />
              </span>
              <h3 className="display mt-5 text-xl">{s.title}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
