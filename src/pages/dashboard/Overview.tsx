import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  Heart,
  MessageSquare,
  CalendarCheck,
  CalendarClock,
  MapPin,
  Video,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import {
  seeker,
  savedPropertyIds,
  inquiries,
  upcomingInspections,
  nextInspection,
  activity,
} from "@/data/seeker";
import { properties, propertyById, realtorById } from "@/data/mock";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const recommended = properties.filter((p) => p.status === "verified").slice(0, 3);
const awaitingReply = inquiries.filter((q) => q.status === "new").length;

export function Overview() {
  const firstName = seeker.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title={`${greeting()}, ${firstName}`}
          subtitle="Here's what's happening with your home search."
        />
      </Reveal>

      {/* stats */}
      <Reveal className="grid grid-cols-3 gap-4 max-md:grid-cols-1" y={16}>
        <StatCard
          icon={Heart}
          label="Saved homes"
          value={savedPropertyIds.length}
          to="/dashboard/saved"
        />
        <StatCard
          icon={MessageSquare}
          label="Inquiries"
          value={inquiries.length}
          hint={awaitingReply > 0 ? `${awaitingReply} awaiting a reply` : "All caught up"}
          to="/dashboard/inquiries"
        />
        <StatCard
          icon={CalendarCheck}
          label="Upcoming inspections"
          value={upcomingInspections.length}
          to="/dashboard/inspections"
        />
      </Reveal>

      {/* next inspection + activity */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-lg:grid-cols-1">
        <Reveal y={16}>
          <Panel
            title="Next inspection"
            action={
              <Link
                to="/dashboard/inspections"
                className="text-sm font-medium text-brand-ink hover:underline"
              >
                View all
              </Link>
            }
            className="h-full"
          >
            {nextInspection ? (
              <NextInspection />
            ) : (
              <p className="py-6 text-muted">No inspections scheduled yet.</p>
            )}
          </Panel>
        </Reveal>

        <Reveal y={16}>
          <Panel title="Recent activity" className="h-full">
            <ul>
              {activity.map((a, i) => (
                <ActivityItem
                  key={a.id}
                  activity={a}
                  isLast={i === activity.length - 1}
                />
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>

      {/* recommendations */}
      <Reveal y={16}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Recommended for you</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <ShieldCheck className="size-4 text-verified" />
              Verified homes, trust-ranked for your search
            </p>
          </div>
          <Link
            to="/listings"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-brand-ink hover:underline max-sm:hidden"
          >
            Browse all
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {recommended.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function NextInspection() {
  const property = propertyById(nextInspection.propertyId);
  const realtor = realtorById(nextInspection.realtorId);
  if (!property) return null;

  const ModeIcon = nextInspection.mode === "virtual" ? Video : MapPin;
  const modeLabel = nextInspection.mode === "virtual" ? "Virtual tour" : "In-person visit";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <DateBlock date={nextInspection.date} />
        <div>
          <p className="font-semibold text-ink">{nextInspection.time}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
            <ModeIcon className="size-4 text-brand-ink" />
            {modeLabel}
          </p>
        </div>
      </div>

      <Link
        to={`/listings/${property.id}`}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3 transition-colors hover:border-brand/40"
      >
        <img
          src={property.image}
          alt={property.title}
          className="size-14 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{property.title}</p>
          <p className="truncate text-sm text-muted">
            {property.location}, {property.city}
          </p>
        </div>
      </Link>

      {realtor && (
        <div className="flex items-center gap-2.5">
          <img
            src={`${realtor.avatar}?auto=format&fit=facearea&facepad=3&w=64&h=64&q=80`}
            alt={realtor.name}
            className="size-8 rounded-full object-cover ring-1 ring-line"
          />
          <p className="text-sm text-muted">
            with <span className="font-medium text-ink">{realtor.name}</span>
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => toast.success("Reschedule request sent")}
          className={buttonClasses("outline", "sm")}
        >
          <CalendarClock className="size-4" aria-hidden />
          Reschedule
        </button>
        <button
          type="button"
          onClick={() => toast.info("Inspection cancelled")}
          className={buttonClasses("ghost", "sm")}
        >
          <X className="size-4" aria-hidden />
          Cancel
        </button>
      </div>
    </div>
  );
}
