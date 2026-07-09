import { Link } from "react-router";
import { BadgeCheck, Check, Tag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const BENEFITS = [
  "Earn the Certified badge buyers actively look for",
  "Verified listings rank ahead of the unverified noise",
  "Build a reputation from real, closed deals",
  "Reach diaspora buyers with remote-ready tools",
];

const IMAGE =
  "https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?auto=format&fit=crop&crop=faces&w=1200&q=80";

export function ForRealtors() {
  return (
    <section className="pb-32 max-lg:pb-24 max-sm:pb-16">
      <Container>
        <Reveal className="overflow-hidden rounded-3xl border border-line bg-surface-2/60">
          <div className="grid grid-cols-2 items-stretch max-lg:grid-cols-1">
            {/* content */}
            <div className="flex flex-col justify-center p-12 max-lg:p-10 max-sm:p-7">
              <span className="eyebrow">For realtors</span>
              <h2 className="display mt-4 text-[2.6rem] text-balance max-lg:text-4xl max-sm:text-3xl">
                Get certified. Win the clients who used to walk away.
              </h2>
              <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
                Serious buyers choose agents they can trust. Pass INSPECTRA's
                certification and stand out from a market full of unverified
                noise.
              </p>

              <ul className="mt-7 space-y-3">
                {BENEFITS.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 text-sm text-ink/85"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/15">
                      <Check
                        className="size-3 text-brand-ink"
                        strokeWidth={3.5}
                        aria-hidden
                      />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-stretch">
                <Link
                  to="/enablement"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                  <BadgeCheck className="size-4" aria-hidden />
                  Start certification
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-7 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                >
                  <Tag className="size-4" aria-hidden />
                  See plans
                </Link>
              </div>
            </div>

            {/* image + floating credential */}
            <div className="relative min-h-full max-lg:order-first max-lg:aspect-16/10">
              <img
                src={IMAGE}
                alt="A certified realtor"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl max-sm:hidden">
                <span className="grid size-10 place-items-center rounded-full bg-emerald-500/12">
                  <BadgeCheck className="size-6 text-emerald-600" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Certified Realtor
                  </p>
                  <p className="text-xs text-slate-500">Issued by INSPECTRA</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
