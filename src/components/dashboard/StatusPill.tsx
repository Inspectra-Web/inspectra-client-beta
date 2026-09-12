import { cn } from "@/lib/cn";

// Dashboard-local status pill for inquiry and inspection states. Kept separate from
// the listing StatusBadge (which is bound to VerificationStatus). Semantic tones only,
// no foil. Every value here is a status the API actually stores: MAP[status] throws on
// a missing key, so a pill can never render a state the record cannot be in.
type PillStatus =
  | "new"
  | "responded"
  | "closed"
  | "requested"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled";

const MAP: Record<PillStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-brand/10 text-brand-ink" },
  responded: { label: "Responded", className: "bg-verified/10 text-verified" },
  // A thread the realtor has retired. Neutral, like a cancelled inspection: it is a
  // finished state, not a bad one.
  closed: { label: "Closed", className: "bg-surface-2 text-muted" },
  // A viewing waiting on the realtor. Brand, because it is the one that needs a human.
  requested: { label: "Requested", className: "bg-brand/10 text-brand-ink" },
  confirmed: { label: "Confirmed", className: "bg-verified/10 text-verified" },
  completed: { label: "Completed", className: "bg-verified/10 text-verified" },
  // The one genuinely negative outcome: the realtor refused the request, and the
  // buyer has to do something about it. Cancelled is neutral by contrast, because
  // either side calling off a viewing they had agreed is routine.
  declined: { label: "Declined", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  cancelled: { label: "Cancelled", className: "bg-surface-2 text-muted" },
};

export function StatusPill({
  status,
  className,
}: {
  status: PillStatus;
  className?: string;
}) {
  const { label, className: tone } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
