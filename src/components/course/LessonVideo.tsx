import { useEffect, useRef, type ComponentRef, type CSSProperties } from "react";
import ReactPlayer from "react-player";
import { RotateCcw, RotateCw } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaLoadingIndicator,
  MediaMuteButton,
  MediaPlayButton,
  MediaPlaybackRateButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";

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

  // A lesson in fullscreen on a phone turns to landscape, and back on leaving. Android
  // Chrome allows the lock only while fullscreen; iPhones rotate their own fullscreen
  // video and have no lock, so the call is tried and its refusal ignored.
  const frame = useRef<ComponentRef<typeof MediaController> | null>(null);
  useEffect(() => {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (to: "landscape") => Promise<void>;
    };
    const onChange = () => {
      const full = document.fullscreenElement;
      if (full && frame.current && (full === frame.current || frame.current.contains(full)))
        orientation.lock?.("landscape").catch(() => undefined);
      else if (!full) orientation.unlock?.();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // One set of INSPECTRA controls (Media Chrome) over every source, so an uploaded file and
  // a YouTube lesson look and work alike. The source's own controls are switched off.
  // YouTube and Vimeo only load, and so only know the length, once played; a file knows it
  // as soon as its metadata arrives.
  return (
    <MediaController ref={frame} className="absolute inset-0 size-full" style={CHROME}>
      <ReactPlayer
        slot="media"
        src={src}
        poster={poster || undefined}
        controls={false}
        playsInline
        width="100%"
        height="100%"
        style={{ width: "100%", height: "100%", "--controls": "none" } as CSSProperties}
        config={{ youtube: { rel: 0 } }}
        onDurationChange={(event) => report(event.currentTarget.duration)}
        onLoadedMetadata={(event) => report(event.currentTarget.duration)}
      />
      {/* Laid over the play button, not beside it, so the button stays dead centre. */}
      <MediaLoadingIndicator slot="centered-chrome" noAutohide style={{ position: "absolute" }} />
      {/* YouTube and Vimeo show their own play button until first played; two would stack. */}
      {!EMBEDDED.has(videoSource(src)) && <MediaPlayButton slot="centered-chrome" style={BIG_PLAY} />}
      <MediaControlBar
        style={{ background: "linear-gradient(to top, rgba(4, 18, 31, 0.85), transparent)", gap: "6px", padding: "0 8px" }}
      >
        <MediaPlayButton />
        {/* Plain arrows instead of Media Chrome's icons, which squeeze a tiny "10" inside. */}
        <MediaSeekBackwardButton seekOffset={10} title="Back 10 seconds">
          <RotateCcw slot="icon" strokeWidth={2.25} style={OUTLINE_ICON} aria-hidden />
        </MediaSeekBackwardButton>
        <MediaSeekForwardButton seekOffset={10} title="Forward 10 seconds">
          <RotateCw slot="icon" strokeWidth={2.25} style={OUTLINE_ICON} aria-hidden />
        </MediaSeekForwardButton>
        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaMuteButton />
        {/* Phones have volume buttons, and a narrow bar needs the room for the progress bar. */}
        <MediaVolumeRange className="max-sm:hidden" />
        <MediaPlaybackRateButton rates={[1, 1.25, 1.5, 2]} className="max-sm:hidden" />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
}

/** Media Chrome reads its look from CSS custom properties: brand blue on a dark scrim. */
const CHROME = {
  "--media-primary-color": "#ffffff",
  "--media-secondary-color": "transparent",
  "--media-control-background": "transparent",
  "--media-control-hover-background": "rgba(255, 255, 255, 0.12)",
  "--media-range-bar-color": "#1AACF0",
  "--media-range-track-background": "rgba(255, 255, 255, 0.25)",
  "--media-range-thumb-background": "#1AACF0",
  "--media-time-range-buffered-color": "rgba(255, 255, 255, 0.45)",
  "--media-font-family": "inherit",
  // Readable without crowding the picture.
  "--media-font-size": "13px",
  "--media-button-icon-width": "22px",
  "--media-button-icon-height": "22px",
  "--media-control-padding": "8px",
  "--media-button-padding": "8px 6px",
  "--media-range-track-height": "4px",
  "--media-range-thumb-width": "12px",
  "--media-range-thumb-height": "12px",
} as CSSProperties;

/** Media Chrome fills its icons; lucide icons are outlines, so they keep no fill. */
const OUTLINE_ICON: CSSProperties = { fill: "none", stroke: "currentColor" };

/** Sources whose own player shows a play button before the first play. */
const EMBEDDED = new Set<VideoSource>(["youtube", "vimeo", "wistia"]);

/** The play button in the middle of the frame, before playback and while paused. */
const BIG_PLAY = {
  "--media-primary-color": "#04121f",
  "--media-control-background": "#1AACF0",
  "--media-control-hover-background": "#38c0ff",
  "--media-button-icon-width": "22px",
  "--media-button-icon-height": "22px",
  padding: "14px",
  borderRadius: "9999px",
  boxShadow: "0 12px 30px -10px rgba(26, 172, 240, 0.9)",
} as CSSProperties;

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
