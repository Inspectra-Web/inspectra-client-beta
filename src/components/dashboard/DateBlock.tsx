import { cn } from "@/lib/cn";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Calendar tile: uppercase month over a large day number, from an ISO date string. */
export function DateBlock({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  // Parse the ISO date defensively without timezone drift (YYYY-MM-DD).
  const [y, m, d] = date.split("-").map(Number);
  const month = MONTHS[(m ?? 1) - 1] ?? "";
  const day = d ?? 1;

  return (
    <div
      className={cn(
        "flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-surface-2 text-center",
        className,
      )}
      aria-label={`${day} ${month} ${y}`}
    >
      <span className="credential-meta text-[0.6rem] text-brand-ink">{month}</span>
      <span className="display text-2xl leading-none text-ink">{day}</span>
    </div>
  );
}
