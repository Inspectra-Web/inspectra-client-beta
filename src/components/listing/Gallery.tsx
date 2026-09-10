import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  Expand,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

export function Gallery({
  images,
  title,
  status,
  heightClass = "h-[75vh] min-h-100 max-h-175 max-sm:h-[46vh] max-sm:min-h-0",
}: {
  images: string[];
  title: string;
  status: VerificationStatus;
  /** Override the hero height (the dashboard uses a shorter reel than the public page). */
  heightClass?: string;
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
        // Square, not the old 8:5. A thumbnail has to stay a uniform size or the strip
        // reads as ragged, so it does crop; a square at least crops a portrait and a
        // landscape equally, where the wide box reduced a portrait to a useless slice.
        "relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 transition-opacity max-sm:size-16 max-sm:rounded-lg",
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
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl bg-surface-2",
          heightClass,
        )}
      >
        <AnimatePresence initial={false}>
          {/* The photo is never cropped: realtors shoot plenty of portraits, and
              object-cover in a landscape frame threw away the top and bottom of the
              building. The frame stays a fixed size so clicking through a mixed set does
              not make the page jump; whatever the contained photo leaves over is filled
              by a blurred copy of itself rather than dead space. */}
          <motion.div
            key={main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduced ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <img
              src={main}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
            />
            <div className="absolute inset-0 bg-[#04121f]/35" />
            <img
              src={main}
              alt={title}
              fetchPriority="high"
              className="relative size-full object-contain"
            />
          </motion.div>
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
  const onPrev = (e: React.MouseEvent) => {
    stop(e);
    prev();
  };
  const onNext = (e: React.MouseEvent) => {
    stop(e);
    next();
  };

  return (
    <div
      className="fixed inset-0 z-70 overflow-hidden bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo ${i + 1} of ${images.length}`}
      onClick={onClose}
    >
      {/* The photo gets the whole viewport. Every piece of chrome below floats over it
          rather than sitting in the flow: a counter row and side gutters wide enough to
          clear the arrows were costing roughly 130px of width and 90px of height, which
          is exactly the room this view exists to give the photo. */}
      <div className="absolute inset-0 flex items-center justify-center p-3 max-sm:p-2">
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
      </div>

      {/* Transparent to clicks so the backdrop still closes; the button takes them back. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-black/70 to-transparent px-5 pb-10 pt-4 text-white/80">
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
          className="pointer-events-auto inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <NavButton
        label="Previous photo"
        Icon={ChevronLeft}
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 max-sm:hidden"
      />
      <NavButton
        label="Next photo"
        Icon={ChevronRight}
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 max-sm:hidden"
      />

      {/* Below sm the arrows sit in a row at the foot instead of flanking the photo,
          where on a narrow screen they would cover most of it. */}
      <div
        onClick={stop}
        className="absolute inset-x-0 bottom-0 hidden items-center justify-center gap-5 bg-linear-to-t from-black/70 to-transparent pb-7 pt-12 max-sm:flex"
      >
        <NavButton label="Previous photo" Icon={ChevronLeft} onClick={onPrev} />
        <NavButton label="Next photo" Icon={ChevronRight} onClick={onNext} />
      </div>
    </div>
  );
}

function NavButton({
  label,
  Icon,
  onClick,
  className,
}: {
  label: string;
  Icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        // Sits over the photograph now, so it needs a backdrop of its own to stay visible
        // against a bright one.
        "inline-flex size-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70",
        className,
      )}
    >
      <Icon className="size-6" aria-hidden />
    </button>
  );
}
