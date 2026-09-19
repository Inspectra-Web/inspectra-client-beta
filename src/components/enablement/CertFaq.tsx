import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

// Answers stay to two sentences. Questions the page already answers in full (the
// syllabus, the fees) are not repeated here.
const FAQS = [
  {
    q: "Who runs the certification?",
    a: "INSPECTRA. We build the curriculum with industry experts, teach it, and certify you at the end as a Certified Real Estate Practitioner of Nigeria.",
  },
  {
    q: "What's the difference between Full-time and Executive?",
    a: "Only the schedule, and so the duration. Full-time runs through the week, Executive at weekends, and both lead to the same certification.",
  },
  {
    q: "Do I need to be certified to list on INSPECTRA?",
    a: "Not today. You can verify your identity, pick a plan and publish without it, but certified realtors rank ahead of uncertified ones in buyer search.",
  },
  {
    q: "How am I assessed?",
    a: "Weekly assessments while you study, a one month internship, then a final exam built on real scenarios. The grading system is published and applied the same way for everyone.",
  },
  {
    q: "Do I have to travel for any of it?",
    a: "No. The teaching, the assessments, the internship supervision and the exam are all online, wherever you are in the country.",
  },
  {
    q: "What happens after I'm certified?",
    a: "You're held to our code of ethics, and you keep access to workshops, webinars and seminars. There's also an annual awards program.",
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
