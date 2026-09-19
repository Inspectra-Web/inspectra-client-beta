import { BadgeCheck, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STAKES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: BadgeCheck,
    title: "Trusted on sight",
    body: "The badge sits on your profile and every listing you publish. Buyers look for it first.",
  },
  {
    Icon: TrendingUp,
    title: "Ranked above the noise",
    body: "Certified realtors and their listings surface first. Your place is earned, never bought.",
  },
  {
    Icon: ShieldCheck,
    title: "Held to a published standard",
    body: "Certified practitioners sign a code of ethics, so a client knows the conduct to expect.",
  },
  {
    Icon: Globe,
    title: "It keeps going after the exam",
    body: "Workshops, webinars and seminars keep you current, plus an annual awards program.",
  },
];

export function CertStakes() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Why it's worth it"
          title="What certification does for you"
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
