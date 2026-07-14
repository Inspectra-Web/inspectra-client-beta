import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  MapPin,
  Video,
  X,
  Check,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { BuyerSummary } from "@/components/realtor/BuyerSummary";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { realtorInspectionById } from "@/data/realtor";
import { propertyById } from "@/data/mock";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS_LONG[(m ?? 1) - 1]} ${y}`;
}

export function RealtorInspectionDetail() {
  const { id } = useParams();
  const inspection = id ? realtorInspectionById(id) : undefined;
  const property = inspection ? propertyById(inspection.propertyId) : undefined;

  if (!inspection || !property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <CalendarCheck className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Inspection not found</h1>
        <p className="mt-2 text-muted">This inspection may have been removed.</p>
        <Link to="/realtor/inspections" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to inspections
        </Link>
      </div>
    );
  }

  const isVirtual = inspection.mode === "virtual";
  const ModeIcon = isVirtual ? Video : MapPin;
  const isUpcoming = inspection.status === "upcoming";

  return (
    <div className="space-y-6">
      <Link
        to="/realtor/inspections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to inspections
      </Link>

      <Reveal>
        <PageHeader
          title={property.title}
          subtitle={`${property.location}, ${property.city}`}
          actions={<StatusPill status={inspection.status} />}
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="space-y-6">
          {/* schedule */}
          <Reveal y={16}>
            <Panel title="Schedule">
              <div className="flex items-start gap-4">
                <DateBlock date={inspection.date} />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{longDate(inspection.date)}</p>
                  <p className="mt-1 text-muted">{inspection.time}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                    <ModeIcon className="size-4 text-brand-ink" aria-hidden />
                    {isVirtual ? "Virtual tour" : "In-person visit"}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                    <User className="size-4 text-faint" aria-hidden />
                    {inspection.buyerName}
                  </p>
                </div>
              </div>

              {isUpcoming && (
                <div className="mt-5 flex gap-2 border-t border-line pt-5">
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
              )}
            </Panel>
          </Reveal>

          {/* status timeline */}
          <Reveal y={16}>
            <Panel title="Status">
              <Timeline status={inspection.status} />
            </Panel>
          </Reveal>
        </div>

        {/* aside */}
        <Reveal y={16} className="space-y-4">
          <BuyerSummary name={inspection.buyerName} subtitle="Booked a viewing" />
          <PropertySummary property={property} />
        </Reveal>
      </div>
    </div>
  );
}

function Timeline({ status }: { status: "upcoming" | "completed" | "cancelled" }) {
  const steps: { label: string; done: boolean; alert?: boolean }[] =
    status === "cancelled"
      ? [
          { label: "Requested", done: true },
          { label: "Cancelled", done: true, alert: true },
        ]
      : [
          { label: "Requested", done: true },
          { label: "Confirmed", done: true },
          {
            label: status === "completed" ? "Completed" : "Awaiting visit",
            done: status === "completed",
          },
        ];

  return (
    <ol className="flex items-center">
      {steps.map((step, i) => (
        <li key={step.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full text-white",
                step.alert
                  ? "bg-rose-500"
                  : step.done
                    ? "bg-verified"
                    : "border border-line bg-surface text-faint",
              )}
            >
              {step.done ? (
                <Check className="size-4" strokeWidth={3} aria-hidden />
              ) : (
                <span className="size-2 rounded-full bg-current" />
              )}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-xs font-medium",
                step.done ? "text-ink" : "text-faint",
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              className={cn(
                "mx-2 -mt-6 h-px flex-1",
                steps[i + 1].done || steps[i + 1].alert ? "bg-verified" : "bg-line",
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
