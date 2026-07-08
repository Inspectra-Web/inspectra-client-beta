import { Search, MapPin, ShieldCheck, BadgeCheck, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=75";

const CHIPS = [
  "3,400+ verified homes",
  "640+ certified realtors",
  "Every fee shown upfront",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft brand glow — warm, not a survey grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brand), transparent 60%)" }}
      />

      <Container className="relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
        {/* left — thesis + search */}
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <BadgeCheck className="size-4" aria-hidden />
            Verified homes · Certified realtors
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Find a home you can trust — before you ever visit.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            INSPECTRA verifies every property's documents, title and fees, and certifies
            every realtor — so you can search, inspect and buy with confidence.
          </p>

          {/* search — the seeker's entry point */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-2 shadow-lg sm:flex-row sm:items-center"
            role="search"
            aria-label="Search verified listings"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <MapPin className="size-4 shrink-0 text-faint" aria-hidden />
              <input
                type="text"
                placeholder="Search by area — Lekki, Maitama, GRA…"
                aria-label="Location"
                className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
              />
            </div>
            <div className="hidden h-6 w-px bg-line sm:block" />
            <label className="flex cursor-pointer items-center gap-2 px-3 text-sm text-muted">
              <input
                type="checkbox"
                defaultChecked
                className="size-4 accent-[var(--color-brand)]"
              />
              Verified only
            </label>
            <button type="submit" className={buttonClasses("primary", "md")}>
              <Search className="size-4" aria-hidden />
              Search
            </button>
          </form>

          {/* trust chips */}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {CHIPS.map((chip) => (
              <li key={chip} className="flex items-center gap-1.5 text-sm text-muted">
                <ShieldCheck className="size-4 text-verified" aria-hidden />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        {/* right — photography with trust cues */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div className="relative overflow-hidden rounded-3xl border border-line shadow-2xl">
            <img
              src={HERO_IMAGE}
              alt="A verified home listed on INSPECTRA"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
            />
            <div className="absolute left-4 top-4">
              <StatusBadge status="verified" onPhoto />
            </div>

            {/* floating certified-realtor cue */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
              <img
                src="https://i.pravatar.cc/80?img=45"
                alt=""
                className="size-11 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                  Adaeze Okonkwo
                  <BadgeCheck className="size-4 text-emerald-600" aria-hidden />
                </p>
                <p className="text-xs text-slate-500">Certified realtor · Lagos</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 text-xs font-semibold text-slate-900">
                <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                96
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
