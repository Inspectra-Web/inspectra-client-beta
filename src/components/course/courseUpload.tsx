import { Loader2 } from "lucide-react";

import { COURSE_UPLOAD_MAX_MB } from "@/lib/course";
import { cn } from "@/lib/cn";

/* Upload progress ------------------------------------------------------------ */

/** A file on its way up. `loaded` and `total` are bytes, browser to API. */
export interface Uploading {
  loaded: number;
  total: number;
  startedAt: number;
}

export const startUpload = (): Uploading => ({ loaded: 0, total: 0, startedAt: Date.now() });

const percentOf = ({ loaded, total }: Uploading) =>
  total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

// Once every byte has reached the API it is still handing the file to Cloudinary,
// which reports nothing, so the bar says so instead of sitting at 100%.
const sent = (u: Uploading) => u.total > 0 && u.loaded >= u.total;

export const chipLabel = (u: Uploading) => (sent(u) ? "Finishing" : `${percentOf(u)}%`);

export const megabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** Time left from the average speed so far. Quiet for the first two seconds, while it is noise. */
function timeLeft(u: Uploading): string | null {
  const elapsed = (Date.now() - u.startedAt) / 1000;
  if (elapsed < 2 || u.loaded === 0) return null;

  const seconds = Math.ceil((u.total - u.loaded) / (u.loaded / elapsed));
  if (seconds < 60) return `about ${Math.max(1, seconds)} sec left`;
  return `about ${Math.ceil(seconds / 60)} min left`;
}

export function UploadStatus({ uploading, label }: { uploading: Uploading; label: string }) {
  const pct = percentOf(uploading);
  const done = sent(uploading);
  const left = timeLeft(uploading);

  return (
    <div className="mt-3" role="status" aria-live="polite">
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-brand transition-[width] duration-300",
            done && "animate-pulse",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs tabular-nums text-muted">
        {done ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Almost done. Large videos take a little longer to finish.
          </>
        ) : (
          <>
            <span className="font-semibold text-ink">{pct}%</span>
            <span>
              {megabytes(uploading.loaded)} of {megabytes(uploading.total)}
            </span>
            {left && <span>· {left}</span>}
          </>
        )}
      </p>
    </div>
  );
}

/* Picked files ------------------------------------------------------------------ */

/** A file chosen in the browser, with the local link the preview and length read from. */
export interface Picked {
  file: File;
  preview: string;
}

/**
 * Refused before a byte is sent: a long upload that fails at the end wastes the wait.
 * Returns the reason, or null when the file can go.
 */
export const tooLarge = (file: File, kind: string): string | null =>
  file.size > COURSE_UPLOAD_MAX_MB * 1024 * 1024
    ? `This ${kind} is ${Math.ceil(file.size / (1024 * 1024))} MB. The limit is ${COURSE_UPLOAD_MAX_MB} MB, so compress it or upload a shorter cut.`
    : null;

export function PendingNote({ picked }: { picked: Picked }) {
  return (
    <p className="mt-2 text-xs text-muted">
      <span className="font-semibold text-ink">{picked.file.name}</span> ·{" "}
      {megabytes(picked.file.size)}
    </p>
  );
}
