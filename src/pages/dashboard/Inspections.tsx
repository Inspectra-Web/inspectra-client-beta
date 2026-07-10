import { useState } from "react";
import { Link } from "react-router";
import { CalendarCheck, MapPin, Video, Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { inspections, type Inspection } from "@/data/seeker";
import { propertyById, realtorById } from "@/data/mock";
import { cn } from "@/lib/cn";

type Tab = "upcoming" | "past";

export function Inspections() {
  const [tab, setTab] = useState<Tab>("upcoming");

  const list = inspections
    .filter((i) => (tab === "upcoming" ? i.status === "upcoming" : i.status !== "upcoming"))
    .sort((a, b) =>
      tab === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Inspections"
          subtitle="Your booked property viewings, in person and virtual."
        />
      </Reveal>

      {/* tabs */}
      <div className="inline-flex rounded-full border border-line bg-surface-2/60 p-1">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                : "text-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="space-y-4">
          {list.map((ins, i) => (
            <Reveal key={ins.id} y={14} delay={i * 0.04}>
              <InspectionRow inspection={ins} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal y={16}>
          <EmptyState
            icon={CalendarCheck}
            title={tab === "upcoming" ? "No upcoming inspections" : "No past inspections"}
            message={
              tab === "upcoming"
                ? "Book a viewing from any listing and it will show up here."
                : "Once you complete a viewing, it will be archived here."
            }
            action={
              tab === "upcoming" ? (
                <Link to="/listings" className={buttonClasses("brand", "md")}>
                  <Search className="size-4" aria-hidden />
                  Browse listings
                </Link>
              ) : undefined
            }
          />
        </Reveal>
      )}
    </div>
  );
}

function InspectionRow({ inspection }: { inspection: Inspection }) {
  const property = propertyById(inspection.propertyId);
  const realtor = realtorById(inspection.realtorId);
  if (!property) return null;

  const ModeIcon = inspection.mode === "virtual" ? Video : MapPin;
  const modeLabel = inspection.mode === "virtual" ? "Virtual tour" : "In-person visit";

  return (
    <article className="group relative flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)] max-sm:gap-4">
      <Link
        to={`/dashboard/inspections/${inspection.id}`}
        aria-label={`Open inspection for ${property.title}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      <DateBlock date={inspection.date} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <p className="font-semibold text-ink">{inspection.time}</p>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <ModeIcon className="size-4 text-brand-ink" aria-hidden />
            {modeLabel}
          </span>
          <StatusPill status={inspection.status} />
        </div>

        <p className="mt-1.5 line-clamp-1 font-medium text-ink">{property.title}</p>
        <p className="line-clamp-1 text-sm text-muted">
          {property.location}, {property.city}
          {realtor && ` · with ${realtor.name}`}
        </p>
      </div>

      <ChevronRight className="size-5 shrink-0 text-faint transition-colors group-hover:text-brand-ink" />
    </article>
  );
}
