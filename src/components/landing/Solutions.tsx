import { motion } from "motion/react";
import { FileCheck2, Receipt, BadgeCheck, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  image: string;
}

const FEATURES: Feature[] = [
  {
    icon: FileCheck2,
    title: "Verified documents",
    body: "Every C of O, survey plan and title is checked before a listing goes live, so what you see is real.",
    image:
      "https://images.unsplash.com/photo-1598994975562-07d0d752f66d?auto=format&fit=crop&crop=faces&w=1100&q=80",
  },
  {
    icon: Receipt,
    title: "Transparent fees",
    body: "See every fee, from agency to legal, itemized upfront before you ever make contact.",
    image:
      "https://images.unsplash.com/photo-1687422809654-579d81c29d32?auto=format&fit=crop&crop=faces&w=1100&q=80",
  },
  {
    icon: BadgeCheck,
    title: "Certified realtors",
    body: "Work only with agents who have passed certification and built a track record you can actually see.",
    image:
      "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?auto=format&fit=crop&crop=faces&w=1100&q=80",
  },
  {
    icon: CalendarCheck,
    title: "Inspections on your terms",
    body: "Book a viewing straight from any listing and coordinate with the certified realtor in-app. The exact address is shared once it's confirmed.",
    image:
      "https://images.unsplash.com/photo-1758526214018-a746f9554b8b?auto=format&fit=crop&crop=faces&w=1100&q=80",
  },
];

export function Solutions() {
  return (
    <section className="py-20 max-lg:py-16 max-sm:py-12">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why INSPECTRA"
          title="Everything you need to buy with confidence"
          intro="We do the checking, so you don't have to take anyone's word for it. Here's what comes standard with every home."
        />

        <div className="mt-16 grid grid-cols-2 gap-6 max-lg:mt-12 max-sm:grid-cols-1">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} index={i} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  image,
  index,
}: Feature & { index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.08 }}
      className="group isolate overflow-hidden rounded-3xl border border-line bg-surface transition-colors duration-300 hover:border-brand/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden transform-gpu">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="size-full transform-gpu object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute left-5 top-5 grid size-11 place-items-center rounded-full bg-white/95 text-brand-ink shadow-sm">
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>
      </div>
      <div className="p-7 max-sm:p-6">
        <h3 className="display text-2xl">{title}</h3>
        <p className="mt-2.5 text-[1.02rem] leading-relaxed text-muted">{body}</p>
      </div>
    </motion.article>
  );
}
