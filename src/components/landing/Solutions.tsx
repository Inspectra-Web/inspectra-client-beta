import { FileCheck2, ReceiptText, UserCheck, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SOLUTIONS = [
  {
    Icon: FileCheck2,
    title: "Verified documents",
    body: "Every C of O, survey plan and title is checked before a listing goes live — so what you see is real.",
  },
  {
    Icon: ReceiptText,
    title: "Transparent fees",
    body: "See every fee — agency, legal, inspection — itemized upfront, before you ever make contact.",
  },
  {
    Icon: UserCheck,
    title: "Certified realtors",
    body: "Work only with agents who've passed certification and built a track record you can actually see.",
  },
  {
    Icon: ShieldCheck,
    title: "Protected payments",
    body: "Book and pay for inspections in-app, with a receipt and a record at every step of the way.",
  },
];

export function Solutions() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why INSPECTRA"
          title="Everything you need to buy with confidence"
          intro="We do the checking, so you don't have to take anyone's word for it. Here's what comes standard with every home on INSPECTRA."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand/12 text-brand">
                <Icon className="size-5.5" strokeWidth={2} aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
