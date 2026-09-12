import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  Check,
  MapPin,
  MessageSquare,
  Navigation,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { RealtorSummary } from "@/components/dashboard/RealtorSummary";
import { Timeline } from "@/components/inspection/Timeline";
import { SlotPicker } from "@/components/inspection/SlotPicker";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { displayName, formatLongDate, formatTime } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import {
  useCancelMyInspection,
  useMyInspection,
  useRescheduleInspection,
  fromSlot,
  toSlot,
  type InspectionDetail as Detail,
} from "@/lib/inspections";

const PREP = [
  "Bring a valid means of identification.",
  "Review the verified title and documents beforehand.",
  "Prepare your questions on fees, service charge and neighbours.",
  "Arrive about 10 minutes early to make the most of the visit.",
];

export function InspectionDetail() {
  const { id } = useParams();

  const { data, isPending, isError, error } = useMyInspection(id ?? "");

  if (isPending) return <DetailSkeleton />;

  if (isError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <CalendarCheck className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Inspection not found</h1>
        <p className="mt-2 max-w-sm text-muted">
          {apiMessage(error, "This viewing may have been removed.")}
        </p>
        <Link to="/dashboard/inspections" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to inspections
        </Link>
      </div>
    );

  return <Loaded data={data} />;
}

function Loaded({ data }: { data: Detail }) {
  const { inspection, property, realtor } = data;

  const reschedule = useRescheduleInspection();
  const cancel = useCancelMyInspection();

  const [moving, setMoving] = useState(false);
  const seed = fromSlot(inspection.slot);
  const [date, setDate] = useState(seed.date);
  const [time, setTime] = useState(seed.time);

  // The two live states: still ahead of the realtor, or agreed and waiting. Both can
  // still be moved or called off; the three terminal states cannot.
  const live = inspection.status === "requested" || inspection.status === "confirmed";
  const address = listingAddress(property);
  const busy = reschedule.isPending || cancel.isPending;

  const onMove = async () => {
    const slot = toSlot(date, time);

    if (!slot) {
      toast.error("Pick a date and a time.");
      return;
    }

    try {
      const result = await reschedule.mutateAsync({ id: inspection.id, slot });
      toast.success(result.message ?? "Your new time is with the realtor.");
      setMoving(false);
    } catch (err) {
      toast.error(apiMessage(err, "Could not move this viewing."));
    }
  };

  const onCancel = async () => {
    try {
      const result = await cancel.mutateAsync(inspection.id);
      toast.success(result.message ?? "Viewing cancelled.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not cancel this viewing."));
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/inspections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to inspections
      </Link>

      <Reveal>
        <PageHeader
          title={property.title}
          subtitle={address}
          actions={<StatusPill status={inspection.status} />}
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="space-y-6">
          <Reveal y={16}>
            <Panel title="Schedule">
              <div className="flex items-start gap-4">
                <DateBlock date={inspection.slot} />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {formatLongDate(inspection.slot)}
                  </p>
                  <p className="mt-1 text-muted">{formatTime(inspection.slot)}</p>
                </div>
              </div>

              {/* Where to go. A real maps link rather than a button that says it
                  opened directions. */}
              {address && (
                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/50 p-4 max-sm:flex-col max-sm:items-stretch">
                  <p className="inline-flex items-center gap-2 text-sm text-muted">
                    <MapPin className="size-4 shrink-0 text-brand-ink" aria-hidden />
                    {address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClasses("outline", "sm")}
                  >
                    <Navigation className="size-4" aria-hidden />
                    Get directions
                  </a>
                </div>
              )}

              {inspection.note && (
                <div className="mt-5 rounded-xl border border-line bg-surface-2/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-faint">
                    Your note
                  </p>
                  <p className="mt-1.5 text-sm text-muted">{inspection.note}</p>
                </div>
              )}

              {inspection.response && (
                <div className="mt-5 rounded-xl border border-brand/30 bg-brand/5 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink">
                    <MessageSquare className="size-3.5" aria-hidden />
                    From {displayName(realtor.fullname).split(" ")[0] ?? "the realtor"}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-ink">
                    {inspection.response}
                  </p>
                </div>
              )}

              {live ? (
                moving ? (
                  <div className="mt-5 rounded-xl border border-line bg-surface-2/50 p-4">
                    <p className="text-sm font-semibold text-ink">Pick a new time</p>
                    <p className="mt-1 text-sm text-muted">
                      Moving a viewing sends it back to the realtor to confirm again.
                    </p>
                    <SlotPicker
                      className="mt-4"
                      date={date}
                      time={time}
                      onDate={setDate}
                      onTime={setTime}
                      disabled={busy}
                    />
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" disabled={busy} onClick={onMove}>
                        <Check className="size-4" aria-hidden />
                        Confirm new time
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => setMoving(false)}
                      >
                        Keep the current time
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setMoving(true)}
                    >
                      <CalendarClock className="size-4" aria-hidden />
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                      <X className="size-4" aria-hidden />
                      Cancel
                    </Button>
                  </div>
                )
              ) : (
                <div className="mt-5">
                  <Link to="/listings" className={buttonClasses("outline", "sm")}>
                    <CalendarClock className="size-4" aria-hidden />
                    Book another viewing
                  </Link>
                </div>
              )}
            </Panel>
          </Reveal>

          <Reveal y={16}>
            <Panel title="Status">
              <Timeline
                status={inspection.status}
                cancelledBy={inspection.cancelledBy}
              />
            </Panel>
          </Reveal>

          {inspection.status === "confirmed" && (
            <Reveal y={16}>
              <Panel title="Prepare for your visit">
                <ul className="space-y-3">
                  {PREP.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm text-muted">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-verified/10 text-verified">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          )}
        </div>

        <Reveal y={16} className="space-y-4">
          <PropertySummary
            image={property.image}
            title={property.title}
            location={address}
            price={property.price}
            listingFor={property.listingStatus}
            status={property.status}
            href={`/listings/${property.slug}`}
          />
          <RealtorSummary
            name={displayName(realtor.fullname)}
            avatar={realtor.avatar}
            agency={realtor.agencyName}
            city={realtor.city}
            certified={realtor.certified}
            href={`/realtors/${realtor.id}`}
          />
          <p className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-xs text-muted">
            <ShieldCheck className="size-4 text-verified" aria-hidden />
            Inspection covered by INSPECTRA trust
          </p>
        </Reveal>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="space-y-2">
        <div className="h-8 w-72 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-52 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}
