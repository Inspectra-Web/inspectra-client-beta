import dayjs from "dayjs";

import { cn } from "@/lib/cn";

/**
 * Calendar tile: uppercase month over a large day number.
 *
 * Takes a full ISO timestamp, since that is what a booked slot is. It reads through
 * dayjs rather than splitting the string by hand so a time component cannot turn the
 * day into NaN, and so the month abbreviates the way the rest of the app does (the
 * "Sept" locale override lives in lib/format.ts and applies to every dayjs call).
 */
export function DateBlock({ date, className }: { date: string; className?: string }) {
  const parsed = dayjs(date);
  const valid = parsed.isValid();

  return (
    <div
      className={cn(
        "flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-surface-2 text-center",
        className,
      )}
      aria-label={valid ? parsed.format("D MMM YYYY") : undefined}
    >
      <span className="credential-meta text-[0.6rem] text-brand-ink">
        {valid ? parsed.format("MMM") : ""}
      </span>
      <span className="display text-2xl leading-none text-ink">
        {valid ? parsed.format("D") : "–"}
      </span>
    </div>
  );
}
