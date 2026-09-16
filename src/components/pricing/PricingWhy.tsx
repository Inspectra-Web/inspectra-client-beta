import {
  BadgeCheck,
  BarChart3,
  Filter,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const BENEFITS: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: ShieldCheck,
    title: "Trust that converts",
    body: "Every listing you publish carries a verified property status and a realtor whose identity was checked. Buyers who scroll past everything else stop on a listing they can trust.",
  },
  {
    Icon: TrendingUp,
    title: "Ranked by trust, not ad spend",
    body: "Placement is earned through verification and your record, not bought in a boost auction. Do the work well and you rise, without paying to outbid the next agent.",
  },
  {
    Icon: BadgeCheck,
    title: "A verified profile that travels",
    body: "Your verified profile goes with you into every deal, a link you can send anywhere, and the professional signal buyers and other agents recognize on sight.",
  },
  {
    Icon: Filter,
    title: "Leads worth your time",
    body: "Itemized fees upfront and trust-ranked placement filter out tyre-kickers. A paid plan opens the full inbox: reply to buyers, see their contact details, and work the lead through to a viewing.",
  },
  {
    Icon: RefreshCw,
    title: "Never look stale",
    body: "Your plan gives you scheduled refreshes to re-confirm a listing is still available. Buyers sorting by newest see a home you stand behind today, not one that sold months ago.",
  },
  {
    Icon: BarChart3,
    title: "Know what is working",
    body: "See views, inquiries, and conversion on every listing, so you know exactly what is landing and can build an on-record track record.",
  },
];

export function PricingWhy() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Why realtors pay"
          title="What your plan is really buying"
          intro="INSPECTRA is not another directory that hands over a phone number and walks away. Paying puts verified trust, real visibility, and the tools to close behind every listing you publish."
        />

        <div className="mt-16 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:mt-12 max-sm:grid-cols-1">
          {BENEFITS.map((b, i) => (
            <Reveal
              key={b.title}
              delay={(i % 3) * 0.07}
              className="flex flex-col rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-brand/40 max-sm:p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand/12">
                <b.Icon className="size-5.5 text-brand-ink" strokeWidth={2} aria-hidden />
              </span>
              <h3 className="display mt-5 text-xl">{b.title}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
                {b.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
