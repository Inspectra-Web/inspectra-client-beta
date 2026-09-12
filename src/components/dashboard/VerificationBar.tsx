import type { ListingCounts } from "@/lib/properties";
import { cn } from "@/lib/cn";

const SEGMENTS: { key: keyof Omit<ListingCounts, "all">; className: string; label: string }[] = [
  { key: "verified", className: "bg-verified", label: "Verified" },
  { key: "pending", className: "bg-gold", label: "Pending" },
  { key: "disputed", className: "bg-rose-500", label: "Disputed" },
];

/**
 * The portfolio's verification split as one bar. Shared by the Overview's card and the
 * Verification page's header strip, which is where the two copies of this lived: the
 * tones and the percentage widths are the part a divergence would quietly break, while
 * the frames around them are deliberately different.
 */
export function VerificationBar({
  counts,
  className,
}: {
  counts: ListingCounts;
  className?: string;
}) {
  return (
    <div className={cn("flex h-2.5 overflow-hidden rounded-full bg-surface-2", className)}>
      {counts.all > 0 &&
        SEGMENTS.map((s) =>
          counts[s.key] > 0 ? (
            <span
              key={s.key}
              className={s.className}
              style={{ width: `${(counts[s.key] / counts.all) * 100}%` }}
            />
          ) : null,
        )}
    </div>
  );
}

/** The legend beneath the bar. Only the Overview's card carries one. */
export function VerificationLegend({ counts }: { counts: ListingCounts }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {SEGMENTS.map((s) => (
        <li key={s.key} className="flex items-center gap-2 text-sm">
          <span className={`size-2.5 rounded-full ${s.className}`} aria-hidden />
          <span className="text-muted">{s.label}</span>
          <span className="font-semibold tabular-nums text-ink">{counts[s.key]}</span>
        </li>
      ))}
    </ul>
  );
}
