import { cn } from "@/lib/cn";

// Dashboard-local status pill for inquiry/inspection states. Kept separate from the
// listing StatusBadge (which is bound to VerificationStatus). Semantic tones only, no foil.
type PillStatus =
  | "new"
  | "responded"
  | "upcoming"
  | "completed"
  | "cancelled";

const MAP: Record<PillStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-brand/10 text-brand-ink" },
  responded: { label: "Responded", className: "bg-verified/10 text-verified" },
  upcoming: { label: "Upcoming", className: "bg-brand/10 text-brand-ink" },
  completed: { label: "Completed", className: "bg-verified/10 text-verified" },
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
