import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Camera, CameraOff, Loader2, RotateCcw, ScanFace, X } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Takes the selfie the server sends on for face matching. The camera has to be
 * ours because the server calls the provider's REST endpoint with an image we
 * supply, rather than handing the whole capture to a hosted widget.
 */

type Stage = "camera" | "review" | "denied" | "unavailable";

const FRAME = 224;

export function IdentityCheckDialog({
  open,
  pending,
  onClose,
  onCapture,
}: {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onCapture: (selfie: File) => void;
}) {
  return (
    <AnimatePresence>
      {open && <Run pending={pending} onClose={onClose} onCapture={onCapture} />}
    </AnimatePresence>
  );
}

function Run({
  pending,
  onClose,
  onCapture,
}: {
  pending: boolean;
  onClose: () => void;
  onCapture: (selfie: File) => void;
}) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>("camera");
  const [shot, setShot] = useState<{ url: string; file: File } | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (stage !== "camera") return;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user", width: 640, height: 640 } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const name = error instanceof Error ? error.name : "";
        setStage(name === "NotFoundError" ? "unavailable" : "denied");
      });

    return () => {
      cancelled = true;
    };
  }, [stage]);

  // The camera light must go out when the dialog does.
  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url); }, [shot]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  function capture() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size,
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setShot({ url: URL.createObjectURL(blob), file });
      stopCamera();
      setStage("review");
    }, "image/jpeg", 0.9);
  }

  const blocked = stage === "denied" || stage === "unavailable";

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Take your selfie"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_70px_-35px_rgba(10,30,45,0.5)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-ink">
            <ScanFace className="size-5" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 font-semibold text-ink">Take your selfie</p>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="px-5 py-5">
          {blocked ? (
            <div className="flex flex-col items-center text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
                <CameraOff className="size-7" aria-hidden />
              </span>
              <p className="mt-4 font-semibold text-ink">
                {stage === "denied" ? "Camera blocked" : "No camera found"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {stage === "denied"
                  ? "Allow camera access in your browser, then try again."
                  : "Connect a camera, or try again on your phone."}
              </p>
            </div>
          ) : (
            <>
              <div
                className="relative mx-auto overflow-hidden rounded-full bg-surface-2 ring-1 ring-line"
                style={{ width: FRAME, height: FRAME }}
              >
                {stage === "camera" ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="size-full -scale-x-100 object-cover"
                  />
                ) : (
                  shot && <img src={shot.url} alt="Your selfie" className="size-full -scale-x-100 object-cover" />
                )}

                {pending && (
                  <div className="absolute inset-0 grid place-items-center bg-ink/40">
                    <Loader2 className="size-8 animate-spin text-white" aria-hidden />
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-sm leading-relaxed text-muted" aria-live="polite">
                {pending
                  ? "Checking your ID and your face."
                  : stage === "camera"
                    ? "Centre your face, look straight ahead, and keep the light in front of you."
                    : "Clear and sharp? Use it, or take another."}
              </p>
            </>
          )}
        </div>

        <div className="border-t border-line bg-surface-2/40 px-5 py-4">
          {stage === "camera" && (
            <Button variant="brand" onClick={capture} className="w-full">
              <Camera className="size-4" aria-hidden />
              Take selfie
            </Button>
          )}

          {stage === "review" && shot && (
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  URL.revokeObjectURL(shot.url);
                  setShot(null);
                  setStage("camera");
                }}
                className={cn(buttonClasses("outline", "md"), "flex-1 disabled:opacity-60")}
              >
                <RotateCcw className="size-4" aria-hidden />
                Retake
              </button>
              <Button
                variant="brand"
                disabled={pending}
                onClick={() => onCapture(shot.file)}
                className="flex-1 disabled:opacity-60"
              >
                {pending ? "Checking…" : "Use this photo"}
              </Button>
            </div>
          )}

          {blocked && (
            <div className="flex gap-2.5">
              <button type="button" onClick={onClose} className={cn(buttonClasses("outline", "md"), "flex-1")}>
                Cancel
              </button>
              <Button variant="brand" onClick={() => setStage("camera")} className="flex-1">
                <RotateCcw className="size-4" aria-hidden />
                Try again
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
