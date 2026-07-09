import { motion } from "motion/react";
import { Check, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

const PROPERTY_CHECKS = [
  "Ownership documents checked",
  "Title matched to the registry",
  "All fees disclosed upfront",
  "No duplicate parcel found",
];

const REALTOR_CHECKS = [
  "Certification exam passed",
  "License verified & valid",
  "61 completed deals on record",
  "No disputes on file",
];

export function TrustLayers() {
  return (
    <section
      id="verification"
      className="border-y border-line bg-surface-2/40 py-32 max-lg:py-24 max-sm:py-16"
    >
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Trust you can see"
          title="The home is verified. The realtor is certified."
          intro="INSPECTRA vouches for both the property and the professional, and shows you the proof behind every listing before you act."
        />

        <div className="mt-20 flex flex-col gap-20 max-lg:mt-14 max-lg:gap-14">
          <TrustRow
            layer="01"
            image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=80"
            imageAlt="A verified property"
            badge={<StatusBadge status="verified" onPhoto />}
            title="Verified before it's ever listed"
            lead="Before a home is shown to you, its paperwork is checked and its title matched to the registry, so the listing you see is one you can act on."
            checks={PROPERTY_CHECKS}
          />
          <TrustRow
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
            title="Certified, not self-declared"
            lead="Every agent earns their place: certified by exam, licensed, and backed by a real, visible track record of closed deals."
            checks={REALTOR_CHECKS}
          />
        </div>
      </Container>
    </section>
  );
}

function TrustRow({
  layer,
  image,
  imageAlt,
  badge,
  title,
  lead,
  checks,
  reverse = false,
}: {
  layer: string;
  image: string;
  imageAlt: string;
  badge: React.ReactNode;
  title: string;
  lead: string;
  checks: string[];
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
      </motion.div>
    </div>
  );
}
