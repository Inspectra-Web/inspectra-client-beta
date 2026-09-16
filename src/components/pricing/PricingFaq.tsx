import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Do I need to be certified to list?",
    a: "No. Verify your identity, pick a plan and publish. Certification is a separate one-time program we are still building, and when it opens it will be an optional credential on your profile rather than a gate on listing. What every listing goes through today is document review, and that is what puts the verified status on it.",
  },
  {
    q: "Can I really start for free?",
    a: "Yes. The Starter plan lets you publish up to three verified listings at no cost, with a verified public profile you can share anywhere. Starter shows you when a lead arrives; replying to buyers and seeing their contact details is what a paid plan adds.",
  },
  {
    q: "How do monthly, quarterly and annual compare?",
    a: "Same features on all three, so it is purely how far ahead you pay. Quarterly takes 10% off the three months, and annual takes 20% off the year. On the Professional plan that is ₦13,500 a month paid quarterly, or ₦12,000 a month paid annually, against ₦15,000 month to month.",
  },
  {
    q: "What is a listing refresh?",
    a: "A refresh is you re-confirming that a listing is still available, which lifts it back to the top of the newest-first results. Professional gets one every two weeks, Business every week, Elite twice a week. Refreshes belong to your account rather than to each listing, so you choose which home to put back in front of buyers.",
  },
  {
    q: "Can I pay to rank higher in search?",
    a: "No, and you never will be able to. Default search ranking is earned through verification and your record, so no amount of spending moves you up it. A refresh only affects the newest-first sort, and only because the listing genuinely was re-confirmed that day.",
  },
  {
    q: "What happens if my subscription lapses?",
    a: "You keep your account, your profile and every conversation already in progress. After a short grace period you drop to Starter limits: listings beyond the free three are hidden rather than deleted, and new leads are held until you renew. Nothing is lost, and your verified listings come back the moment you are active again.",
  },
  {
    q: "Can I change plans later?",
    a: "Anytime. Upgrade the moment you outgrow your listing limit and the new features apply straight away. You can move down at the end of a billing cycle with no penalty.",
  },
  {
    q: "Do buyers pay to use INSPECTRA?",
    a: "No. Browsing, searching, saving homes, booking a viewing, and contacting realtors is always free for buyers. Only realtors pay, through a subscription.",
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
