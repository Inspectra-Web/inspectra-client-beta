import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { api, apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { displayName, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;
/** Roughly a page width at 100%, which is what "fits" means on a first open. */
const BASE_WIDTH = 820;

/**
 * Reads a title document in place.
 *
 * The pages are painted to canvas by pdf.js rather than handed to the browser's own PDF
 * plugin. That is deliberate: the plugin runs in its own browsing context, so its Save
 * and Print context menu cannot be reached from our JavaScript, and `#toolbar=0` only
 * ever hid it on Chromium (Firefox and Safari ignore it and show a download button).
 * Painting it ourselves means the surface is our DOM, so the menu is genuinely ours to
 * suppress, and it looks the same in every browser.
 *
 * Every page is stamped with the viewer's identity. None of this makes a document
 * uncopyable, and it is not meant to: the bytes are in the reader's machine either way.
 * It removes the casual affordance, and the stamp makes a leaked copy attributable.
 */
export function DocumentViewer({
  open,
  onClose,
  title,
  path,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  path: string;
}) {
  const user = useAuthUser();
  const pagesRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pages, setPages] = useState(0);
  const [doc, setDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  // Fetch and parse once per document. Deliberately not keyed on zoom: `destroy` tears
  // down the pdf.js worker, and doing that mid-flight on every zoom click left the next
  // task waiting on a worker that no longer existed. It hung silently, with no error.
  useEffect(() => {
    if (!open || !path) return;

    let cancelled = false;
    let task: pdfjs.PDFDocumentLoadingTask | undefined;

    async function load() {
      setDoc(null);
      setError("");
      setLoading(true);

      try {
        const res = await api.get<ArrayBuffer>(path, { responseType: "arraybuffer" });
        task = pdfjs.getDocument({ data: new Uint8Array(res.data) });
        const loaded = await task.promise;

        if (cancelled) return;

        setPages(loaded.numPages);
        setDoc(loaded);
      } catch (cause) {
        if (cancelled) return;
        setError(apiMessage(cause, "Could not open this document."));
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [open, path]);

  // Paint. Re-runs on zoom, and only ever touches an already-parsed document.
  useEffect(() => {
    if (!doc) return;

    let cancelled = false;
    let painting: pdfjs.RenderTask | undefined;

    async function paint() {
      if (!doc) return;

      setLoading(true);

      const host = pagesRef.current;
      if (!host) return;

      try {
        const painted = document.createDocumentFragment();

        // Canvas is device pixels; the CSS size is what the reader sees. Without this a
        // survey plan is unreadable on a retina screen at any zoom.
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const stamp = [
          displayName(user.fullname),
          user.email,
          formatDate(new Date().toISOString()),
        ];

        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;

          const natural = page.getViewport({ scale: 1 });
          const scale = ((BASE_WIDTH * zoom) / natural.width) * ratio;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / ratio}px`;
          canvas.className = "mx-auto block max-w-full rounded-lg bg-white shadow-lg";
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `Page ${n} of ${doc.numPages}`);

          // `canvas` alone, never alongside `canvasContext`: pdf.js treats passing both as
          // invalid, and the render promise then never settles, with no error to show for it.
          painting = page.render({ canvas, viewport });
          await painting.promise;
          if (cancelled) return;

          const context = canvas.getContext("2d");
          if (context) stampIdentity(context, canvas.width, canvas.height, ratio, stamp);

          painted.append(canvas);
        }

        // Swapped in one go, so the reader never sees a half-drawn document.
        host.replaceChildren(painted);
        setLoading(false);
      } catch (cause) {
        // A cancelled render rejects by design; only a real failure is worth reporting.
        if (cancelled) return;
        setError(apiMessage(cause, "Could not open this document."));
        setLoading(false);
      }
    }

    void paint();

    return () => {
      cancelled = true;
      painting?.cancel();
    };
  }, [doc, zoom, user.fullname, user.email]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-[#04121f]/90 p-6 backdrop-blur-sm max-sm:p-3"
    >
      <header className="mb-3 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          {pages > 0 && (
            <p className="text-xs text-white/60 tabular-nums">
              {pages} {pages === 1 ? "page" : "pages"}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Zoom
            label="Zoom out"
            Icon={Minus}
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          />
          <span className="w-12 text-center text-xs text-white/70 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Zoom
            label="Zoom in"
            Icon={Plus}
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          />
          <Zoom label="Close document" Icon={X} onClick={onClose} className="ml-2" />
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          // The whole point: this is our DOM, so the menu is ours to refuse.
          onContextMenu={(e) => e.preventDefault()}
          className="h-full select-none overflow-auto rounded-xl bg-surface-2 p-6 max-sm:p-3"
        >
          <div ref={pagesRef} className="space-y-6" />
        </div>

        {/* Overlaid rather than swapped in, so a zoom keeps the pages on screen while the
            next render is painted instead of blinking back to a spinner. */}
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-surface-2/75 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Opening document
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface-2 px-6 text-center text-sm text-muted">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A repeating diagonal stamp of who is reading. Drawn after the page so it cannot be
 * peeled off the render, and kept faint enough to read the document through.
 */
function stampIdentity(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio: number,
  lines: string[],
) {
  const text = lines.join("  ·  ");

  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 6);
  context.font = `${13 * ratio}px "DM Sans", system-ui, sans-serif`;
  context.fillStyle = "rgba(10, 30, 45, 0.13)";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const step = 150 * ratio;
  const reach = Math.hypot(width, height) / 2;

  for (let y = -reach; y <= reach; y += step) {
    for (let x = -reach; x <= reach; x += context.measureText(text).width + step) {
      context.fillText(text, x, y);
    }
  }

  context.restore();
}

function Zoom({
  label,
  Icon,
  onClick,
  disabled = false,
  className,
}: {
  label: string;
  Icon: typeof X;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors",
        "hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <Icon className="size-4.5" aria-hidden />
    </button>
  );
}
