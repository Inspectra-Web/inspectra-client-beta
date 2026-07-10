import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Is certification required to list on INSPECTRA?",
    a: "Yes. Every realtor completes certification before publishing a listing. It's the trust bar the whole platform is built on, and the reason buyers trust who they're dealing with.",
  },
  {
    q: "What's the pass mark, and can I retake the exam?",
    a: "You need 75% to pass. If you don't clear it the first time, you get two free retakes before you'd need to re-enroll, so a bad exam day doesn't cost you the program.",
  },
  {
    q: "How long does it take?",
    a: "The six modules are self-paced and run about eight hours in total; the exam itself is 60 minutes. Most realtors finish within a week of enrolling.",
  },
  {
    q: "Does the certification expire?",
    a: "It stays valid for two years. When it's time to renew, you take a short refresher rather than sitting the full program again.",
  },
  {
    q: "How does it help my listings?",
    a: "Once you're certified, your status shows on your public profile and every listing you publish, and certified realtors rank ahead of uncertified ones in buyer search, so more of the right buyers find you.",
  },
  {
    q: "What does it cost?",
    a: "A single one-time payment to enroll, with the full amount shown in the enrollment section above. There's no subscription to stay certified, and no charge for retakes.",
  },
];

export function CertFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Questions"
          title="Before you enroll"
          intro="The things realtors ask us most about getting certified."
        />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-line border-y border-line max-sm:mt-10">
          {FAQS.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
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
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
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
