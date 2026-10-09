import { motion } from "motion/react";
import { BadgeCheck, FileCheck2, Inbox, Wallet } from "lucide-react";
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
    icon: BadgeCheck,
    title: "A badge that opens doors",
    body: "Verify your identity once and every listing you post carries the Verified realtor seal buyers stop for.",
    image:
      "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?auto=format&fit=crop&crop=faces&w=1100&q=80",
  },
  {
    icon: FileCheck2,
    title: "Listings buyers believe",
    body: "Each property goes live after its documents clear review, so you stand out from a market full of unverified noise.",
    image:
      "https://images.unsplash.com/photo-1598994975562-07d0d752f66d?auto=format&fit=crop&crop=faces&w=1100&q=80",
  },
  {
    icon: Inbox,
    title: "Leads worth your time",
    body: "Inquiries arrive from buyers who have already seen the documents and the itemized fees. Fewer tyre-kickers, more closings.",
    image:
      "https://images.pexels.com/photos/13801545/pexels-photo-13801545.jpeg?auto=compress&cs=tinysrgb&w=1100",
  },
  {
    icon: Wallet,
    title: "Paid inspections, on record",
    body: "Buyers book and pay for viewings in-app, and each fee lands in your own account once the viewing is confirmed. No cash, no chasing.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1100&q=80",
  },
];

export function RealtorValue() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-14">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why list on INSPECTRA"
          title="Everything you need to close with confidence"
          intro="Trust is the hardest thing to sell in Nigerian real estate. We put it on your listings for you."
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
