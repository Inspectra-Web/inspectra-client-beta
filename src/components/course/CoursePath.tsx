import { Coins, CreditCard, PlayCircle, Sparkles, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPriceFull } from "@/lib/format";

export function CoursePath({ price }: { price: number }) {
  const steps: { title: string; body: string; Icon: LucideIcon }[] = [
    {
      title: `Enrol for ${formatPriceFull(price)}`,
      body: "One form, one payment. Your dashboard opens straight away.",
      Icon: CreditCard,
    },
    {
      title: "Take the masterclasses",
      body: "Blockchain, then AI storytelling that turns viewers into buyers.",
      Icon: Sparkles,
    },
    {
      title: "How INSPECTRA works",
      body: "How your rewards are earned, and how to make the most of it.",
      Icon: PlayCircle,
    },
    {
      title: "Earn on every deal",
      body: "A $USD digital asset on every INSPECTRA transaction you close.",
      Icon: Coins,
    },
  ];

  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From one video to earning your first deflationary digital asset in $USD"
          intro="Deflationary means that as you earn, scarcity sets in: the total supply of the asset decreases."
        />

        {/* Each card spans three shared rows (head, title, body), so they line up across
            the row even when one title wraps. */}
        <ol className="mt-16 grid grid-cols-4 gap-x-5 gap-y-5 max-lg:grid-cols-2 max-sm:mt-12 max-sm:grid-cols-1">
          {steps.map(({ title, body, Icon }, i) => (
            <li key={title} className="row-span-3 grid grid-rows-subgrid">
              <Reveal
                y={16}
                delay={i * 0.06}
                className="row-span-3 grid grid-rows-subgrid gap-y-0 rounded-2xl border border-line bg-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand-ink">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="display text-3xl tabular-nums text-line">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-snug text-ink">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
