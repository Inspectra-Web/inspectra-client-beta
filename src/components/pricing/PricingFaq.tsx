import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Is certification included in a plan?",
    a: "No. Certification is a separate one-time step you complete before you can list, and it stays valid for two years. Your subscription is the recurring plan on top of that, and it decides how much you list and how far you reach.",
  },
  {
    q: "Can I really start for free?",
    a: "Yes. Once you are certified, the Starter plan lets you publish up to three verified listings at no cost. You only move up to a paid plan when you need more listings or the growth features.",
  },
  {
    q: "Can I change plans later?",
    a: "Anytime. Upgrade the moment you outgrow your listing limit and the new features apply straight away. You can downgrade at the end of a billing cycle with no penalty.",
  },
  {
    q: "What is the difference between monthly and annual?",
    a: "Same features either way. Paying yearly costs the equivalent of ten months instead of twelve, so you get two months free for committing up front.",
  },
  {
    q: "Do buyers pay to use INSPECTRA?",
    a: "No. Browsing, searching, saving homes, booking a viewing, and contacting realtors is always free for buyers. Only realtors pay, through certification and a subscription.",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Questions"
          title="Before you pick a plan"
          intro="The things realtors ask us most about pricing and how payment works."
        />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-line border-y border-line max-sm:mt-10">
          {FAQS.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`pricing-faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`pricing-faq-panel-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="display text-xl max-sm:text-lg">{f.q}</span>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border transition-transform duration-300",
                        isOpen
                          ? "rotate-45 border-brand/40 text-brand-ink"
                          : "border-line text-muted",
                      )}
                    >
                      <Plus className="size-4" aria-hidden />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`pricing-faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`pricing-faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
                      }
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-[0.98rem] leading-relaxed text-muted">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
