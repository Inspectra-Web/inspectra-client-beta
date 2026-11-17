import { useCallback, useEffect, useRef, type Ref, type RefCallback, type SyntheticEvent } from "react";
import ReactPlayer from "react-player";

import { cn } from "@/lib/cn";

/**
 * One lesson's video, wherever it lives: an uploaded file, a direct video link, or a
 * YouTube, Vimeo or Wistia link. react-player gives every one of them the same
 * <video>-like surface (current time, duration, seeking, ended), so the course's
 * no-skip and finish rules work the same on all of them.
 */
export function LessonVideo({
  src,
  poster,
  playerRef,
  className,
  onTimeUpdate,
  onSeeking,
  onEnded,
  onDuration,
}: {
  src: string;
  poster?: string;
  playerRef?: Ref<HTMLVideoElement>;
  className?: string;
  onTimeUpdate?: (video: HTMLVideoElement) => void;
  onSeeking?: (video: HTMLVideoElement) => void;
  onEnded?: (video: HTMLVideoElement) => void;
  /** The length in seconds, once the player knows it. */
  onDuration?: (seconds: number) => void;
}) {
  const target = (event: SyntheticEvent<HTMLVideoElement>) => event.currentTarget;

  // The element, kept here as well as handed to the caller.
  const element = useRef<HTMLVideoElement | null>(null);
  const attach = useCallback<RefCallback<HTMLVideoElement>>(
    (node) => {
      element.current = node;
      if (typeof playerRef === "function") playerRef(node);
      else if (playerRef) playerRef.current = node;
    },
    [playerRef],
  );

  // YouTube and Vimeo only announce the length once playback starts, though their player
  // knows it as soon as it is ready. Once ready, the length is read off it, checked briefly
  // until it arrives.
  const reported = useRef(false);
  const latest = useRef(onDuration);
  useEffect(() => {
    latest.current = onDuration;
  });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  function report(seconds: number | undefined) {
    if (reported.current || !seconds || !Number.isFinite(seconds) || seconds <= 0) return false;
    reported.current = true;
    latest.current?.(seconds);
    return true;
  }

  function readWhenReady() {
    if (!onDuration) return;
    for (let i = 1; i <= 10; i++)
      timers.current.push(window.setTimeout(() => report(element.current?.duration), i * 400));
  }

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-black", className)}>
      <ReactPlayer
        ref={attach}
        src={src}
        poster={poster || undefined}
        controls
        controlsList="nodownload noplaybackrate"
        playsInline
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        config={{ youtube: { rel: 0 } }}
        onTimeUpdate={onTimeUpdate && ((event) => onTimeUpdate(target(event)))}
        onSeeking={onSeeking && ((event) => onSeeking(target(event)))}
        onEnded={onEnded && ((event) => onEnded(target(event)))}
        onReady={readWhenReady}
        onDurationChange={onDuration && ((event) => void report(target(event).duration))}
      />
    </div>
  );
}

export type VideoSource = "upload" | "youtube" | "vimeo" | "wistia" | "file" | "drive" | "unknown";

/** What a pasted link is, so the dialog can say whether it will play. */
export function videoSource(url: string): VideoSource {
  if (!url) return "unknown";
  if (url.startsWith("blob:") || /res\.cloudinary\.com\/[^/]+\/video\//.test(url)) return "upload";
  if (/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)\//.test(hostAndPath(url))) return "youtube";
  if (/(^|\.)vimeo\.com\//.test(hostAndPath(url))) return "vimeo";
  if (/(^|\.)(wistia\.com|wistia\.net|wi\.st)\//.test(hostAndPath(url))) return "wistia";
  if (/(^|\.)drive\.google\.com\//.test(hostAndPath(url)) || /docs\.google\.com\//.test(url)) return "drive";
  if (/\.(mp4|webm|mov|m4v|ogv|m3u8)(\?|#|$)/i.test(url)) return "file";
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
