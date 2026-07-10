import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

export interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Shared editorial layout for the legal/content pages (Terms, Privacy): a title block,
 * a sticky table of contents on desktop, and a readable prose column. Content pages, so
 * they sit inside the normal layout (header/footer) rather than a dark hero.
 */
export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <Container className="py-20 max-sm:py-14">
      <Reveal className="max-w-2xl">
        <span className="eyebrow">Legal</span>
        <h1 className="display mt-4 text-5xl max-sm:text-4xl">{title}</h1>
        <p className="credential-meta mt-4 text-[0.7rem] text-faint">
          Last updated {updated}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-[220px_1fr] gap-14 max-lg:grid-cols-1 max-lg:gap-8">
        {/* table of contents */}
        <aside className="max-lg:hidden">
          <nav className="sticky top-24">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">
              On this page
            </p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* prose */}
        <div className="max-w-2xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="display text-2xl">
                <span className="text-brand-ink">{i + 1}.</span> {s.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-muted [&_a]:font-medium [&_a]:text-brand-ink [&_a]:underline [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
