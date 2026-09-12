import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CheckCheck,
  MapPin,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { BuyerSummary } from "@/components/realtor/BuyerSummary";
import { Timeline } from "@/components/inspection/Timeline";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { displayName, formatLongDate, formatTime } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import {
  useCancelRealtorInspection,
  useDecideInspection,
  useRealtorInspection,
  slotPassed,
  type DiaryDetail,
  type InspectionDecision,
} from "@/lib/inspections";

const RESPONSE_MAX = 500;

export function RealtorInspectionDetail() {
  const { id } = useParams();

  const { data, isPending, isError, error } = useRealtorInspection(id ?? "");

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
        <Link to="/realtor/inspections" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to inspections
        </Link>
      </div>
    );

  return <Loaded data={data} />;
}

function Loaded({ data }: { data: DiaryDetail }) {
  const { inspection, property, seeker } = data;

  const decide = useDecideInspection();
  const cancel = useCancelRealtorInspection();

  // The composer is one box serving both answers: confirming leaves a note (and for
  // a virtual tour, the joining link), declining has to say why.
  const [replying, setReplying] = useState<InspectionDecision | null>(null);
  const [response, setResponse] = useState("");

  const buyer = displayName(seeker.fullname);
  const address = listingAddress(property);
  const busy = decide.isPending || cancel.isPending;

  const waiting = inspection.status === "requested";
  const confirmed = inspection.status === "confirmed";
  const declining = replying === "declined";

  const send = async (status: InspectionDecision, note?: string) => {
    try {
      const result = await decide.mutateAsync({ id: inspection.id, status, response: note });
      toast.success(result.message ?? "Viewing updated.");
      setReplying(null);
      setResponse("");
    } catch (err) {
      toast.error(apiMessage(err, "Could not update this viewing."));
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
        to="/realtor/inspections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to inspections
      </Link>

      <Reveal>
        <PageHeader
          title={property.title}
          subtitle={`Viewing booked by ${buyer}`}
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
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                    <User className="size-4 text-brand-ink" aria-hidden />
                    {buyer}
                  </p>
                </div>
              </div>

              {!!address && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/50 p-4 text-sm text-muted">
                  <MapPin className="size-4 shrink-0 text-brand-ink" aria-hidden />
                  {address}
                </p>
              )}

              {inspection.note && (
                <div className="mt-5 rounded-xl border border-brand/30 bg-brand/5 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink">
                    <MessageSquare className="size-3.5" aria-hidden />
                    From {buyer.split(" ")[0] ?? "the buyer"}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-ink">
                    {inspection.note}
                  </p>
                </div>
              )}

              {inspection.response && (
                <div className="mt-5 rounded-xl border border-line bg-surface-2/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-faint">
                    Your reply
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-muted">
                    {inspection.response}
                  </p>
                </div>
              )}
            </Panel>
          </Reveal>

          {(waiting || confirmed) && (
            <Reveal y={16}>
              <Panel title={waiting ? "Answer this request" : "Manage this viewing"}>
                {waiting && !replying && (
                  <p className="mb-4 text-sm text-muted">
                    The buyer is waiting on you. Confirming puts it in both diaries.
                  </p>
                )}
                {replying ? (
                  <>
                    <label
                      htmlFor="inspection-response"
                      className="text-sm font-medium text-ink"
                    >
                      {declining
                        ? "Why can't you make it?"
                        : "Add a note for the buyer (optional)"}
                    </label>
                    <p className="mt-1 text-sm text-muted">
                      {declining
                        ? "The buyer sees this and can propose another time, so give them something to work with."
                        : "Anything they should know before turning up: parking, the gate, who to ask for."}
                    </p>
                    <textarea
                      id="inspection-response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                      maxLength={RESPONSE_MAX}
                      placeholder={
                        declining
                          ? "I'm showing another property that morning. Saturday after 11am works."
                          : "Come to the black gate and ask for Musa at the desk."
                      }
                      className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    />

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy || (declining && !response.trim())}
                        onClick={() => void send(replying, response.trim() || undefined)}
                      >
                        {declining ? (
                          <>
                            <X className="size-4" aria-hidden />
                            Decline viewing
                          </>
                        ) : (
                          <>
                            <Check className="size-4" aria-hidden />
                            Confirm viewing
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          setReplying(null);
                          setResponse("");
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {waiting && (
                      <>
                        <Button
                          variant="brand"
                          size="sm"
                          disabled={busy}
                          onClick={() => setReplying("confirmed")}
                        >
                          <Check className="size-4" aria-hidden />
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => setReplying("declined")}
                        >
                          <X className="size-4" aria-hidden />
                          Decline
                        </Button>
                      </>
                    )}

                    {/* Only once the slot has passed. The API refuses to close out a
                        viewing that has not happened, so offering it earlier would
                        be a button that cannot do its job. */}
                    {confirmed && slotPassed(inspection.slot) && (
                      <Button
                        variant="brand"
                        size="sm"
                        disabled={busy}
                        onClick={() => void send("completed")}
                      >
                        <CheckCheck className="size-4" aria-hidden />
                        Mark as done
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                      <X className="size-4" aria-hidden />
                      {waiting ? "Cancel request" : "Cancel viewing"}
                    </Button>
                  </div>
                )}

                {confirmed && !slotPassed(inspection.slot) && !replying && (
                  <p className="mt-4 text-sm text-muted">
                    You can close this out once the viewing has happened.
                  </p>
                )}
              </Panel>
            </Reveal>
          )}

          <Reveal y={16}>
            <Panel title="Status">
              <Timeline status={inspection.status} cancelledBy={inspection.cancelledBy} />
            </Panel>
          </Reveal>
        </div>

        <Reveal y={16} className="space-y-4">
          <BuyerSummary
            name={buyer}
            avatar={seeker.avatar}
            subtitle="Booked a viewing"
          />
          <PropertySummary
            image={property.image}
            title={property.title}
            location={address}
            price={property.price}
            listingFor={property.listingStatus}
            status={property.status}
            href={`/listings/${property.slug}`}
          />
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
        <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}
