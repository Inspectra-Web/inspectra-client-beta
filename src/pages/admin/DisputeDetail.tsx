import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowLeft, Scale } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import {
  useAdminDispute,
  useDecideDispute,
  type DisputeDetail,
  type DisputeOutcome,
  type DisputeParty,
} from "@/lib/adminDisputes";
import type { EscrowAnswer } from "@/lib/inspections";
import { displayName, formatDate, formatLongDate, formatPriceFull, formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { OUTCOME_LABEL } from "@/pages/admin/Disputes";

const NOTE_MIN = 10;
const NOTE_MAX = 500;

export function AdminDisputeDetail() {
  const { id } = useParams();
  const { data, isPending, isError, error } = useAdminDispute(id ?? "");

  if (isPending) return <div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />;

  if (isError)
    return <EmptyState icon={Scale} title="Could not load this dispute" message={apiMessage(error)} />;

  return <Loaded data={data} />;
}

function Loaded({ data }: { data: DisputeDetail }) {
  const { inspection, property, seeker, realtor, payment } = data;
  const { escrow } = inspection;
  const open = escrow.status === "disputed";
  const buyer = displayName(seeker.fullname);
  const lister = displayName(realtor.fullname);

  return (
    <div className="space-y-6">
      <Link
        to="/admin/disputes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to disputes
      </Link>

      <Reveal>
        <PageHeader
          title={property.title}
          subtitle={`Viewing on ${formatLongDate(inspection.slot)} at ${formatTime(inspection.slot)}`}
          actions={
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                open ? "bg-rose-500/10 text-rose-500" : "bg-verified/12 text-verified",
              )}
            >
              {open ? "Open" : escrow.dispute.outcome ? OUTCOME_LABEL[escrow.dispute.outcome] : "Decided"}
            </span>
          }
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="min-w-0 space-y-6">
          <Reveal y={16}>
            <Panel title="What each side said">
              <p className="text-sm text-ink">{escrow.dispute.reason}</p>
              {escrow.dispute.openedAt && (
                <p className="mt-1 text-xs text-faint">
                  Opened {formatDate(escrow.dispute.openedAt)} at {formatTime(escrow.dispute.openedAt)}
                </p>
              )}
              <dl className="mt-5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Said who={`${buyer} (buyer)`} answer={escrow.seekerAnswer} other={lister} />
                <Said who={`${lister} (realtor)`} answer={escrow.realtorAnswer} other={buyer} />
              </dl>
            </Panel>
          </Reveal>

          <Reveal y={16}>
            <Panel title="The money">
              <div className="overflow-hidden rounded-xl border border-line text-sm">
                <Row label="Realtor's fee" value={formatPriceFull(escrow.fee)} />
                <Row label="INSPECTRA service charge" value={formatPriceFull(escrow.commission)} />
                <Row label="Paid by the buyer" value={formatPriceFull(escrow.total)} strong />
              </div>
              {payment && (
                <p className="mt-3 text-xs text-muted">
                  {payment.reference}
                  {payment.channel ? ` · ${payment.channel}` : ""}
                  {payment.paidAt ? ` · paid ${formatDate(payment.paidAt)}` : ""}
                </p>
              )}
            </Panel>
          </Reveal>

          <Reveal y={16}>
            {open ? (
              <DecisionForm data={data} buyer={buyer} lister={lister} />
            ) : (
              <Panel title="Decision">
                <p className="text-sm text-ink">
                  {escrow.dispute.outcome ? OUTCOME_LABEL[escrow.dispute.outcome] : "Decided"}
                  {escrow.dispute.decidedAt ? ` on ${formatDate(escrow.dispute.decidedAt)}` : ""}.
                </p>
                {escrow.dispute.note && <p className="mt-2 text-sm text-muted">{escrow.dispute.note}</p>}
                <p className="mt-3 text-xs text-faint">Money: {MONEY_STATE[escrow.status] ?? escrow.status}</p>
              </Panel>
            )}
          </Reveal>
        </div>

        <Reveal y={16} className="space-y-4">
          <PartyCard role="Buyer" person={seeker} href={`/admin/users/${seeker.id}`} />
          <PartyCard role="Realtor" person={realtor} href={`/admin/realtors/${realtor.id}`} />
          <Link
            to={`/listings/${property.slug}`}
            className="block rounded-2xl border border-line bg-surface p-4 text-sm text-muted transition-colors hover:text-ink"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-faint">Listing</span>
            <span className="mt-1 block font-medium text-ink">{property.title}</span>
            {property.fullAddress}
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

const MONEY_STATE: Record<string, string> = {
  held: "queued to move",
  releasing: "paying the realtor",
  released: "paid to the realtor",
  refunding: "refunding the buyer",
  refunded: "refunded",
};

function Said({ who, answer, other }: { who: string; answer: EscrowAnswer; other: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/40 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-faint">{who}</dt>
      <dd className="mt-1 text-sm text-ink">
        {answer.answer === "happened"
          ? "It happened"
          : answer.answer === "no_show"
            ? `${other} didn't show up`
            : "No answer"}
        {answer.at && (
          <span className="block text-xs text-muted">
            {formatDate(answer.at)} at {formatTime(answer.at)}
          </span>
        )}
      </dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0", strong && "bg-surface-2/60")}>
      <span className={strong ? "font-semibold text-ink" : "text-muted"}>{label}</span>
      <span className={cn("tabular-nums text-ink", strong && "font-semibold")}>{value}</span>
    </div>
  );
}

function PartyCard({ role, person, href }: { role: string; person: DisputeParty; href: string }) {
  const name = displayName(person.fullname);

  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40"
    >
      <UserAvatar name={name} avatar={person.avatar} className="size-10" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">{role}</p>
        <p className="truncate font-medium text-ink">{name}</p>
        <p className="truncate text-xs text-muted">{person.email}</p>
      </div>
    </Link>
  );
}

const OUTCOMES: { value: DisputeOutcome; title: string; body: string }[] = [
  { value: "release", title: "Pay the realtor", body: "The full fee goes to the realtor." },
  { value: "refund", title: "Refund the buyer", body: "Everything the buyer paid goes back." },
  { value: "split", title: "Split the fee", body: "The realtor gets part of the fee; the rest is refunded." },
];

/**
 * The ruling. Nothing moves until it is confirmed in a dialog that states exactly who
 * gets what, because a transfer or refund cannot be called back from here.
 */
function DecisionForm({ data, buyer, lister }: { data: DisputeDetail; buyer: string; lister: string }) {
  const decide = useDecideDispute();
  const { escrow } = data.inspection;

  const [outcome, setOutcome] = useState<DisputeOutcome | null>(null);
  const [share, setShare] = useState("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  const realtorShare = Number(share);
  const shareValid = Number.isInteger(realtorShare) && realtorShare > 0 && realtorShare < escrow.fee;
  const ready =
    outcome !== null && note.trim().length >= NOTE_MIN && (outcome !== "split" || shareValid);

  const summary =
    outcome === "release"
      ? `${formatPriceFull(escrow.fee)} is paid to ${lister}. INSPECTRA keeps the ${formatPriceFull(escrow.commission)} service charge.`
      : outcome === "refund"
        ? `${formatPriceFull(escrow.total)} is refunded to ${buyer}, service charge included.`
        : shareValid
          ? `${formatPriceFull(realtorShare)} is paid to ${lister}, ${formatPriceFull(escrow.fee - realtorShare)} is refunded to ${buyer}, and INSPECTRA keeps the ${formatPriceFull(escrow.commission)} service charge.`
          : "";

  const submit = async () => {
    if (!outcome) return;

    try {
      const result = await decide.mutateAsync({
        id: data.inspection.id,
        outcome,
        note: note.trim(),
        ...(outcome === "split" ? { realtorShare } : {}),
      });
      toast.success(result.message ?? "Decision recorded.");
      setConfirming(false);
    } catch (err) {
      toast.error(apiMessage(err, "Could not record the decision."));
    }
  };

  return (
    <Panel title="Decide">
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        {OUTCOMES.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOutcome(o.value)}
            aria-pressed={outcome === o.value}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              outcome === o.value ? "border-brand bg-brand/5" : "border-line hover:border-brand/40",
            )}
          >
            <span className="block text-sm font-semibold text-ink">{o.title}</span>
            <span className="mt-1 block text-xs text-muted">{o.body}</span>
          </button>
        ))}
      </div>

      {outcome === "split" && (
        <label className="mt-5 block">
          <span className="text-sm font-medium text-ink">Realtor's share of the {formatPriceFull(escrow.fee)} fee (₦)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={escrow.fee - 1}
            value={share}
            onChange={(e) => setShare(e.target.value)}
            className="mt-2 h-11 w-56 rounded-xl border border-line bg-surface px-4 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          />
          {share && !shareValid && (
            <span className="mt-1 block text-xs text-rose-500">
              Between ₦1 and {formatPriceFull(escrow.fee - 1)}. For all of it, choose Pay the realtor.
            </span>
          )}
        </label>
      )}

      <label className="mt-5 block">
        <span className="text-sm font-medium text-ink">Note to both sides</span>
        <span className="mt-0.5 block text-xs text-muted">
          They both receive this with the outcome, so say what the evidence showed.
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={NOTE_MAX}
          className="mt-2 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          placeholder="Both sides sent photos from the gate; the realtor arrived 40 minutes late."
        />
      </label>

      {summary && <p className="mt-4 rounded-xl border border-line bg-surface-2/50 p-3 text-sm text-ink">{summary}</p>}

      <Button variant="brand" className="mt-5" disabled={!ready || decide.isPending} onClick={() => setConfirming(true)}>
        <Scale className="size-4" aria-hidden />
        Record decision
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Record this decision?"
        description={`${summary} Both sides are emailed, and the money starts moving straight away.`}
        confirmLabel="Record and move the money"
        cancelLabel="Go back"
        pending={decide.isPending}
        onConfirm={submit}
      />
    </Panel>
  );
}
