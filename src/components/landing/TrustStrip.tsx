import { Container } from "@/components/ui/Container";
import { stats } from "@/data/mock";

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface-2/40">
      <Container className="grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-2 py-8 text-center">
            <div className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1.5 text-[0.72rem] font-medium uppercase tracking-wider text-faint">
              {s.label}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
