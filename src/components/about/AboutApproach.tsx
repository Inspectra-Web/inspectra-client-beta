import { motion } from "motion/react";
import { Check, BadgeCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

const PROPERTY_CHECKS = [
  "Ownership documents checked",
  "Title matched to the registry",
  "Fees disclosed upfront",
  "Duplicate parcels flagged",
];

const REALTOR_CHECKS = [
  "Certification completed",
  "License verified and valid",
  "Track record on record",
  "Disputes visible, not hidden",
];

export function AboutApproach() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="How we do it"
          title="One platform, verified on both sides."
          intro="Most platforms vouch for the agent, or for no one. INSPECTRA is built on dual verification: the property and the professional are each checked before you ever act."
        />

        <div className="mt-20 flex flex-col gap-20 max-lg:mt-14 max-lg:gap-14">
          <ApproachRow
            layer="01"
            image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=80"
            imageAlt="A verified property"
            badge={<StatusBadge status="verified" onPhoto />}
            title="The property is verified"
            lead="Before a home reaches you, its paperwork is checked, its title matched to the registry, and its fees laid out in full. It carries a Verified, Pending or Disputed status you can see at a glance."
            checks={PROPERTY_CHECKS}
            cta={{ label: "See verified listings", to: "/listings" }}
          />
          <ApproachRow
            reverse
            layer="02"
            image="https://images.unsplash.com/photo-1578758803946-2c4f6738df87?auto=format&fit=crop&crop=faces&w=1100&q=80"
            imageAlt="A certified realtor"
            badge={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-black/5">
                <BadgeCheck className="size-3.5 text-emerald-600" aria-hidden />
                Certified
              </span>
            }
            title="The realtor is certified"
            lead="Every agent earns their place through certification, then carries a credential buyers recognize. Certification is the standard to list, so the people you deal with have been held to one."
            checks={REALTOR_CHECKS}
            cta={{ label: "How certification works", to: "/enablement" }}
          />
        </div>
      </Container>
    </section>
  );
}

function ApproachRow({
  layer,
  image,
  imageAlt,
  badge,
  title,
  lead,
  checks,
  cta,
  reverse = false,
}: {
  layer: string;
  image: string;
  imageAlt: string;
  badge: React.ReactNode;
  title: string;
  lead: string;
  checks: string[];
  cta: { label: string; to: string };
  reverse?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 items-center gap-14 max-lg:grid-cols-1 max-lg:gap-8">
      {/* image */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-line",
          reverse ? "order-2 max-lg:order-1" : "order-1",
        )}
      >
        <img
          src={image}
          alt={imageAlt}
          className="aspect-[5/4] w-full object-cover max-lg:aspect-[16/10]"
        />
        <div className="absolute left-5 top-5">{badge}</div>
      </motion.div>

      {/* text */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(reverse ? "order-1 max-lg:order-2" : "order-2")}
      >
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brand-ink">
          Layer {layer}
        </span>
        <h3 className="display mt-3 text-4xl max-sm:text-3xl">{title}</h3>
        <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-muted">{lead}</p>
        <ul className="mt-7 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {checks.map((c) => (
            <li key={c} className="flex items-center gap-2.5 text-sm text-ink/80">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-verified/15">
                <Check className="size-3 text-verified" strokeWidth={3.5} aria-hidden />
              </span>
              {c}
            </li>
          ))}
        </ul>
        <Link
          to={cta.to}
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink transition-colors hover:text-brand"
        >
          {cta.label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}
