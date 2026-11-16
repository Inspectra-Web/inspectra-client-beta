import { CreditCard, PlayCircle, KeyRound, Building2, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPriceFull } from "@/lib/format";

export function CoursePath({ price }: { price: number }) {
  const steps: { title: string; body: string; Icon: LucideIcon }[] = [
    {
      title: `Create your account and pay ${formatPriceFull(price)}`,
      body: "One form and one payment by card or bank transfer. Your course link arrives by email.",
      Icon: CreditCard,
    },
    {
      title: "Watch the video",
      body: "A short video on how INSPECTRA works for you and how the reward is earned.",
      Icon: PlayCircle,
    },
    {
      title: "Open your realtor console",
      body: "It opens the moment the video ends. Verify your identity, then list.",
      Icon: KeyRound,
    },
    {
      title: "Sell on INSPECTRA",
      body: "Close sales on the platform with your clients and earn your reward on each one.",
      Icon: Building2,
    },
  ];

  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From one video to your first sale"
          intro="Four steps, in this order. Nothing to download and no exam."
        />

        <ol className="relative mt-16 grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-lg:gap-y-12 max-sm:mt-12 max-sm:grid-cols-1">
          <span
            aria-hidden
            className="absolute left-0 right-0 top-6 h-px bg-line max-lg:hidden"
          />
          {steps.map(({ title, body, Icon }, i) => (
            <li key={title} className="relative">
              <Reveal y={16} delay={i * 0.06}>
                <span className="relative grid size-12 place-items-center rounded-full border border-line bg-bg text-ink">
                  <Icon className="size-5" aria-hidden />
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-brand text-[0.68rem] font-semibold tabular-nums text-[#04121f]">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
