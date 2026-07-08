import { Search, FolderCheck, CalendarCheck, KeyRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    n: "01",
    Icon: Search,
    title: "Search verified homes",
    body: "Browse listings whose documents and title have already cleared review — ranked by trust, not by who paid to appear first.",
  },
  {
    n: "02",
    Icon: FolderCheck,
    title: "Review everything upfront",
    body: "Open the documents, the itemized fees and the neighborhood details before you make a single call.",
  },
  {
    n: "03",
    Icon: CalendarCheck,
    title: "Book an inspection",
    body: "Reserve a slot and pay securely in-app — you get a receipt and a record, not cash in an envelope.",
  },
  {
    n: "04",
    Icon: KeyRound,
    title: "Move in with confidence",
    body: "Close knowing the home, the fees and the agent all checked out from the very beginning.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface-2/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Your whole search, on solid ground"
          intro="Four simple steps take you from browsing to your keys — each one backed by verification you can see."
        />

        <ol className="mt-16 grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
          {STEPS.map(({ n, Icon, title, body }, i) => (
            <li key={n} className="relative">
              {i < STEPS.length - 1 && (
                <span
                  className="absolute left-6 top-6 hidden h-px w-[calc(100%-1rem)] bg-gradient-to-r from-line to-transparent lg:block"
                  aria-hidden
                />
              )}
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-brand/30 bg-surface text-brand shadow-sm">
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="font-display text-2xl font-bold text-brand/30">{n}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
