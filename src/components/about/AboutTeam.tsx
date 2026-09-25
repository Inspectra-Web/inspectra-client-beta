import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { initials } from "@/lib/format";
import franklinOkoro from "@/assets/team/devfranklin.jpg";
import ugoPeters from "@/assets/team/ugopeters.jpg";

type Member = {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  linkedin?: string;
};

// lucide dropped its brand glyphs, so the LinkedIn mark is inline.
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.06c.53-.95 1.84-1.96 3.78-1.96 4.04 0 4.79 2.54 4.79 5.85V21h-4v-5.66c0-1.35-.03-3.09-1.94-3.09-1.94 0-2.24 1.47-2.24 2.99V21h-4V9Z" />
    </svg>
  );
}

const TEAM: Member[] = [
  {
    name: "Ugo Peters",
    role: "Chief Executive Officer",
    bio: "Sets company direction and owns the partnerships, investor relationships and market strategy behind INSPECTRA.",
    photo: ugoPeters,
    linkedin: "https://www.linkedin.com/in/ugo-peters",
  },
  {
    name: "Franklin Okoro",
    role: "Chief Technical Officer",
    bio: "Leads product and engineering, building the dual verification system and the marketplace that runs on it.",
    photo: franklinOkoro,
    linkedin: "https://www.linkedin.com/in/devfranklinandrew",
  },
  {
    name: "Eze Uchechi",
    role: "Project Manager",
    bio: "Runs day-to-day administration and internal project coordination, keeping verification and realtor onboarding moving.",
  },
];

export function AboutTeam() {
  return (
    <section className="py-28 max-lg:py-20 max-sm:py-16">
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
              {/* 3:4 matches the source photo exactly, so nothing is cropped. */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-surface-2">
                    <span className="display text-6xl text-faint max-sm:text-5xl" aria-hidden>
                      {initials(m.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 max-sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="display text-xl">{m.name}</h3>
                    <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-ink">
                      {m.role}
                    </p>
                  </div>

                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand-ink"
                    >
                      <LinkedInIcon className="size-4" />
                      <span className="sr-only">{m.name} on LinkedIn</span>
                    </a>
                  )}
                </div>

                <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
