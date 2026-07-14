import { FileWarning, Copy, EyeOff, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const PROBLEMS: { Icon: LucideIcon; title: string; body: string; answer: string }[] = [
  {
    Icon: FileWarning,
    title: "Documents nobody checked",
    body: "Fake C of O, unverified survey plans and disputed titles pass from listing to buyer with no one accountable for the paperwork.",
    answer: "We verify documents and match the title before a home goes live.",
  },
  {
    Icon: Copy,
    title: "The same plot, sold twice",
    body: "Duplicate listings for one parcel are everywhere, and there is no defense against a property being marketed by several sellers at once.",
    answer: "We flag duplicate parcels so one home means one honest listing.",
  },
  {
    Icon: EyeOff,
    title: "Fees hidden until it's too late",
    body: "Agency, legal and agreement fees stay invisible until you have already committed, turning a fair price into an unpleasant surprise.",
    answer: "Every fee is itemized and disclosed upfront, before you inspect.",
  },
  {
    Icon: UserX,
    title: "Anyone can pose as an agent",
    body: "With no training, no track record and no accountability, there is nothing to tell a real professional from someone who vanishes when a deal goes wrong.",
    answer: "Every realtor is certified and accountable before they can list.",
  },
];

export function AboutProblem() {
  return (
    <section className="border-y border-line bg-surface-2/40 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Why we exist"
          title="The market ran on buyer beware. We changed the default."
          intro="These are the everyday failures Nigerian property buyers learned to accept. INSPECTRA is built to answer each one, not just list around them."
        />

        <div className="mt-16 grid grid-cols-2 gap-5 max-sm:mt-12 max-sm:grid-cols-1">
          {PROBLEMS.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.07}
              className="flex flex-col rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-brand/40 max-sm:p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand/12">
                <p.Icon className="size-5.5 text-brand-ink" strokeWidth={2} aria-hidden />
              </span>
              <h3 className="display mt-5 text-xl">{p.title}</h3>
              <p className="mt-2.5 flex-1 text-[0.95rem] leading-relaxed text-muted">
                {p.body}
              </p>
              <p className="mt-4 border-t border-line pt-4 text-[0.9rem] font-medium text-ink">
                {p.answer}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
