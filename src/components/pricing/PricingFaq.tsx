import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

// Answers stay to two sentences. "Do I need to be certified to list?" is not here:
// the certification band directly above this section already answers it.
const FAQS = [
  {
    q: "Can I really start for free?",
    a: "Yes. Starter publishes up to three verified listings with a public profile you can share anywhere. Replying to buyers and seeing their contact details is what a paid plan adds.",
  },
  {
    q: "How do monthly, quarterly and annual compare?",
    a: "Same features on all three, so it is purely how far ahead you pay. Quarterly takes 10% off, annual takes 20%.",
  },
  {
    q: "What is a listing refresh?",
    a: "Re-confirming that a listing is still available, which lifts it back to the top of newest-first results. Refreshes belong to your account, so you choose which home to put back in front of buyers.",
  },
  {
    q: "Can I pay to rank higher in search?",
    a: "No, and you never will be able to. Ranking is earned through verification and your record, and a refresh only moves you in the newest-first sort.",
  },
  {
    q: "What happens if my subscription lapses?",
    a: "You keep your account, your profile and every conversation in progress. After a short grace period you drop to Starter limits: extra listings are hidden rather than deleted, and come back the moment you renew.",
  },
  {
    q: "Can I change plans later?",
    a: "Anytime. Upgrades apply straight away, and you can move down at the end of a billing cycle with no penalty.",
  },
  {
    q: "Do buyers pay to use INSPECTRA?",
    a: "No. Browsing, saving homes, booking a viewing and contacting realtors is always free for buyers. Only realtors pay.",
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
