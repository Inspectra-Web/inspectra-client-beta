import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

import { cn } from "@/lib/cn";

/**
 * One lesson's video, wherever it lives: an uploaded file (on an address that expires),
 * a direct video link, a YouTube, Vimeo or Wistia link through react-player, or a Google
 * Drive file through Drive's own embedded player. Watching is not tracked, so the player
 * is left to do its job: any part, any order.
 */
export function LessonVideo({
  src,
  poster,
  className,
  onDuration,
}: {
  src: string;
  poster?: string;
  className?: string;
  /** The length in seconds, once the player knows it. Drive never reports it. */
  onDuration?: (seconds: number) => void;
}) {
  const drive = driveEmbedUrl(src);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-black", className)}>
      {drive ? (
        <iframe
          src={drive}
          title="Lesson video"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <Player src={src} poster={poster} onDuration={onDuration} />
      )}
    </div>
  );
}

function Player({
  src,
  poster,
  onDuration,
}: {
  src: string;
  poster?: string;
  onDuration?: (seconds: number) => void;
}) {
  const reported = useRef(false);
  const latest = useRef(onDuration);
  useEffect(() => {
    latest.current = onDuration;
  });

  function report(seconds: number | undefined) {
    if (reported.current || !seconds || !Number.isFinite(seconds) || seconds <= 0) return;
    reported.current = true;
    latest.current?.(seconds);
  }

  // YouTube and Vimeo only load, and so only know the length, once played; a file knows it
  // as soon as its metadata arrives.
  return (
    <ReactPlayer
      src={src}
      poster={poster || undefined}
      controls
      controlsList="nodownload"
      playsInline
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      config={{ youtube: { rel: 0 } }}
      onDurationChange={(event) => report(event.currentTarget.duration)}
      onLoadedMetadata={(event) => report(event.currentTarget.duration)}
    />
  );
}

/** A Google Drive file's embeddable player address, or null for any other link. */
export function driveEmbedUrl(url: string): string | null {
  const id =
    /drive\.google\.com\/file\/d\/([\w-]{10,})/.exec(url)?.[1] ??
    /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]{10,})/.exec(url)?.[1];
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export type VideoSource = "youtube" | "vimeo" | "wistia" | "drive" | "file" | "unknown";

/** What a pasted link is, so the dialog can say how it will play. */
export function videoSource(url: string): VideoSource {
  if (!url) return "unknown";
  if (driveEmbedUrl(url)) return "drive";
  const at = hostAndPath(url);
  if (/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)\//.test(at)) return "youtube";
  if (/(^|\.)vimeo\.com\//.test(at)) return "vimeo";
  if (/(^|\.)(wistia\.com|wistia\.net|wi\.st)\//.test(at)) return "wistia";
  if (url.startsWith("blob:") || /\.(mp4|webm|mov|m4v|ogv|m3u8)(\?|#|$)/i.test(url)) return "file";
  return "unknown";
}

const hostAndPath = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
};
