import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { readTour } from "@/lib/listing";

/**
 * The listing's video tour. Renders nothing when there is none, so a page can drop it
 * in unconditionally.
 *
 * An embed starts as a facade over the listing's own first photo rather than the live
 * player. Two reasons: a YouTube iframe is a heavy third-party payload on a page whose
 * job is to load fast, and it sets its cookies on arrival whether or not the video is
 * ever watched. The poster is our own photo, not the provider's thumbnail, so nothing
 * is fetched from them until the reader asks for it.
 */
export function VideoTour({
  videoUrl,
  video,
  poster,
  title,
  className,
}: {
  videoUrl: string;
  video: string;
  poster?: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const tour = readTour(videoUrl, video);

  if (!tour) return null;

  const frame = "relative aspect-video w-full overflow-hidden rounded-2xl bg-[#06121b]";

  if (tour.kind === "link")
    return (
      <a
        href={tour.src}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all duration-300",
          "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]",
          className,
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-[#04121f]">
          <Play className="size-5 fill-current" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">Watch the video tour</span>
          {/* The host, not the URL: a pasted link can be long enough to break the row. */}
          <span className="block truncate text-sm text-muted">
            Opens on {hostOf(tour.src)}
          </span>
        </span>
        <ExternalLink className="ml-auto size-4 shrink-0 text-faint" aria-hidden />
      </a>
    );

  if (tour.kind === "file")
    return (
      <div className={cn(frame, className)}>
        <video
          controls
          preload="metadata"
          poster={poster}
          className="size-full object-contain"
        >
          <source src={tour.src} />
          Your browser cannot play this video.
        </video>
      </div>
    );

  return (
    <div className={cn(frame, className)}>
      {playing ? (
        <iframe
          src={`${tour.src}?autoplay=1`}
          title={`Video tour of ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play the video tour of ${title}`}
          className="group size-full"
        >
          {poster && (
            <img
              src={poster}
              alt=""
              className="size-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-60"
            />
          )}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-brand text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform duration-300 group-hover:scale-110 max-sm:size-14">
              <Play className="ml-0.5 size-6 fill-current" aria-hidden />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "another site";
  }
}
