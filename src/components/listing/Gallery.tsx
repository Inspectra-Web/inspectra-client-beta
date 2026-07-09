import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

export function Gallery({
  images,
  title,
  status,
}: {
  images: string[];
  title: string;
  status: VerificationStatus;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const main = images[active] ?? images[0];
  const scrollable = images.length >= 10;
  const reduced = useReducedMotion();
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Clicking a thumbnail slides it to the middle of the strip, revealing the
  // photos that come next. Nothing moves until the user acts.
  useEffect(() => {
    if (!scrollable) return;
    const strip = stripRef.current;
    const el = thumbRefs.current[active];
    if (!strip || !el) return;
    strip.scrollTo({
      left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [active, scrollable, reduced]);

  const thumb = (src: string, i: number, key: string) => (
    <button
      type="button"
      key={key}
      ref={(el) => {
        thumbRefs.current[i] = el;
      }}
      onClick={() => setActive(i)}
      aria-label={`Show photo ${i + 1}`}
      aria-current={i === active}
      className={cn(
        "relative h-20 w-32 shrink-0 overflow-hidden rounded-xl transition-opacity max-sm:h-16 max-sm:w-24 max-sm:rounded-lg",
        i === active
          ? "ring-2 ring-brand ring-offset-2 ring-offset-bg"
          : "opacity-60 hover:opacity-100",
      )}
    >
      <img src={src} alt="" loading="lazy" className="size-full object-cover" />
    </button>
  );

  return (
    <>
      {/* hero image — click to enlarge */}
      <button
        type="button"
        onClick={() => setLightbox(active)}
        aria-label="Open photo gallery"
        className="group relative block h-[75vh] min-h-85 max-h-155 w-full overflow-hidden rounded-2xl bg-surface-2 max-sm:h-[42vh] max-sm:min-h-0"
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={main}
            src={main}
            alt={title}
            fetchPriority="high"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduced ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
        <StatusBadge
          status={status}
          onPhoto
          className="absolute left-4 top-4"
        />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          <Expand className="size-3.5" aria-hidden />
          {images.length} photos
        </span>
      </button>

      {/* thumbnail strip — centered when few; scroll-to-clicked reel when there are many */}
      {scrollable ? (
        <div
          ref={stripRef}
          className="no-scrollbar relative mt-2 flex gap-3 overflow-x-auto p-2 max-sm:gap-2"
        >
          {images.map((src, i) => thumb(src, i, `${src}-${i}`))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap justify-center gap-3 max-sm:gap-2">
          {images.map((src, i) => thumb(src, i, `${src}-${i}`))}
        </div>
      )}

      {lightbox !== null && (
        <Lightbox
          images={images}
          start={lightbox}
          title={title}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

const slideVariants: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d >= 0 ? 64 : -64, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -64 : 64, scale: 0.98 }),
};

function Lightbox({
  images,
  start,
  title,
  onClose,
}: {
  images: string[];
  start: number;
  title: string;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const [[i, dir], setState] = useState<[number, number]>([start, 0]);
  const paginate = useCallback(
    (d: number) =>
      setState(([v]) => [(v + d + images.length) % images.length, d]),
    [images.length],
  );
  const prev = useCallback(() => paginate(-1), [paginate]);
  const next = useCallback(() => paginate(1), [paginate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-70 flex flex-col overflow-hidden bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo ${i + 1} of ${images.length}`}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 text-white/80">
        <span className="text-sm tabular-nums">
          {i + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onClose();
          }}
          autoFocus
          aria-label="Close gallery"
          className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-16 pb-8 max-sm:px-3">
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            prev();
          }}
          aria-label="Previous photo"
          className="absolute left-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 max-sm:left-1"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={i}
            src={images[i]}
            alt={`${title} — photo ${i + 1}`}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reduced ? 0 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={stop}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </AnimatePresence>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            next();
          }}
          aria-label="Next photo"
          className="absolute right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 max-sm:right-1"
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
