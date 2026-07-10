import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

// Placeholder leadership for the current phase (mock, marketing only).
const TEAM: { name: string; role: string; bio: string; photo: string }[] = [
  {
    name: "Emeka Adeyemi",
    role: "Founder & CEO",
    bio: "Spent a decade watching good deals collapse on bad paperwork. Built INSPECTRA to make verified mean verified.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&w=600&q=80",
  },
  {
    name: "Ngozi Balogun",
    role: "Head of Verification",
    bio: "Leads the document and title checks that stand behind every Verified badge on the platform.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=600&q=80",
  },
  {
    name: "Tunde Okafor",
    role: "Head of Product",
    bio: "Turns a hard trust problem into a platform buyers and realtors actually want to use.",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=faces&w=600&q=80",
  },
  {
    name: "Aisha Mohammed",
    role: "Head of Realtor Enablement",
    bio: "Runs the certification program that raises the standard every agent is held to.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=600&q=80",
  },
  {
    name: "Chidi Nwankwo",
    role: "Head of Engineering",
    bio: "Builds the systems that keep verification fast, fair and hard to game.",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=faces&w=600&q=80",
  },
  {
    name: "Folake Adeniyi",
    role: "Head of Trust & Safety",
    bio: "Owns disputes, reviews and the guardrails that keep the marketplace honest.",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&crop=faces&w=600&q=80",
  },
];

export function AboutTeam() {
  return (
    <section className="border-y border-line bg-surface-2/40 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="The team"
          title="The people who stand behind the badge."
          intro="A small team obsessed with one thing: that a verified home on INSPECTRA is a home you can trust."
        />

        <div className="mt-16 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:mt-12 max-sm:grid-cols-1">
          {TEAM.map((m, i) => (
            <Reveal
              key={m.name}
              delay={(i % 3) * 0.07}
              className="group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={m.photo}
                  alt={m.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6 max-sm:p-5">
                <h3 className="display text-xl">{m.name}</h3>
                <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-ink">
                  {m.role}
                </p>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
