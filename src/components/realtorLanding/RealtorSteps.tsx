import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "Sign up as a realtor and set up your public profile in minutes.",
  },
  {
    n: "02",
    title: "Verify your identity",
    body: "A one-time check earns the Verified realtor badge on everything you post.",
  },
  {
    n: "03",
    title: "List your properties",
    body: "Add each home with its documents. It goes live as soon as it clears review.",
  },
  {
    n: "04",
    title: "Take paid inspections",
    body: "Buyers book viewings in-app, and you meet the ones who are ready to move.",
  },
];

export function RealtorSteps() {
  return (
    <section className="pb-32 max-lg:pb-24 max-sm:pb-16">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From sign-up to your first viewing"
          intro="Four steps stand between you and buyers who already trust what they see."
        />

        <div className="mt-14 grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:mt-10 max-sm:grid-cols-1">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 0.07}
              className="relative rounded-2xl border border-line bg-surface p-7 transition-colors duration-300 hover:border-brand/40 max-sm:p-6"
            >
              <div>
                <span className="display text-4xl text-brand-ink">{step.n}</span>
                <h3 className="display mt-5 text-xl">{step.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
