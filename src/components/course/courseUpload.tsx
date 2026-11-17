import { useEffect, useRef, useState } from "react";
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

/* Video length ----------------------------------------------------------------- */

/** A file picked in this browser, or one stored in the course's own Cloudinary folder. */
export const isUploadedVideo = (url: string): boolean =>
  url.startsWith("blob:") ||
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:v\d+\/)?inspectra\/course\//.test(url);

export type LengthState = "idle" | "reading" | "read" | "failed";

/**
 * Loads only the video's metadata and reports its length in whole minutes, rounded up so
 * a 7:10 video reads "8 min". Duration needs no CORS, so a pasted link works as well as
 * an upload.
 */
export function useVideoMinutes(url: string, onMinutes: (minutes: number) => void): LengthState {
  const [state, setState] = useState<LengthState>("idle");
  const latest = useRef(onMinutes);

  useEffect(() => {
    latest.current = onMinutes;
  });

  useEffect(() => {
    if (!url) {
      setState("idle");
      return;
    }

    let cancelled = false;
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.muted = true;

    probe.onloadedmetadata = () => {
      if (cancelled) return;
      const seconds = probe.duration;
      if (!Number.isFinite(seconds) || seconds <= 0) {
        setState("failed");
        return;
      }
      latest.current(Math.max(1, Math.ceil(seconds / 60)));
      setState("read");
    };
    probe.onerror = () => {
      if (!cancelled) setState("failed");
    };

    setState("reading");
    probe.src = url;

    return () => {
      cancelled = true;
      probe.removeAttribute("src");
      probe.load();
    };
  }, [url]);

  return state;
}
