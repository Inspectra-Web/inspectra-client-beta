import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Camera,
  CameraOff,
  Glasses,
  Loader2,
  MonitorX,
  RotateCcw,
  ScanFace,
  Sun,
  X,
} from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * The liveness check. The server sends the selfie to the provider's liveness and face-match
 * endpoints, so the camera has to be ours rather than a hosted widget's.
 */

type Stage = "intro" | "camera" | "review" | "denied" | "unavailable";

const FRAME = 232;

const STEPS = [
  { Icon: Sun, title: "Face the light", text: "Light in front of you, not behind." },
  { Icon: Glasses, title: "Uncover your face", text: "No glasses, cap or face mask." },
  { Icon: ScanFace, title: "Fill the oval", text: "Look straight at the camera, eyes open." },
  { Icon: MonitorX, title: "Be there in person", text: "A photo or a screen will fail." },
];

const TITLES: Record<Stage, string> = {
  intro: "Liveness check",
  camera: "Fit your face in the oval",
  review: "Check your photo",
  denied: "Liveness check",
  unavailable: "Liveness check",
};

export function IdentityCheckDialog({
  open,
  pending,
  attemptsLeft,
  onClose,
  onCapture,
}: {
  open: boolean;
  pending: boolean;
  attemptsLeft: number;
  onClose: () => void;
  onCapture: (selfie: File) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <Run pending={pending} attemptsLeft={attemptsLeft} onClose={onClose} onCapture={onCapture} />
      )}
    </AnimatePresence>
  );
}

function Run({
  pending,
  attemptsLeft,
  onClose,
  onCapture,
}: {
  pending: boolean;
  attemptsLeft: number;
  onClose: () => void;
  onCapture: (selfie: File) => void;
}) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>("intro");
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

  function retake() {
    if (shot) URL.revokeObjectURL(shot.url);
    setShot(null);
    setStage("camera");
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
      aria-label="Liveness check"
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
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{pending ? "Checking" : TITLES[stage]}</p>
            <p className="text-xs text-faint">
              {attemptsLeft === 1 ? "Last attempt" : `${attemptsLeft} attempts left`}
            </p>
          </div>
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
          {stage === "intro" && (
            <>
              <p className="text-sm leading-relaxed text-muted">
                We take one photo to confirm a real person is present and that it is the face
                on your NIN. Before you start:
              </p>
              <ul className="mt-4 space-y-3">
                {STEPS.map(({ Icon, title, text }) => (
                  <li key={title} className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand-ink">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{title}</p>
                      <p className="text-xs text-muted">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {blocked && (
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
          )}

          {(stage === "camera" || stage === "review") && (
            <>
              <div
                className="relative mx-auto overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line"
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
                  shot && (
                    <img src={shot.url} alt="Your selfie" className="size-full -scale-x-100 object-cover" />
                  )
                )}

                {/* The oval guide: everything outside it is dimmed. */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 shadow-[0_0_0_999px_rgba(10,20,30,0.45)]",
                    stage === "camera" ? "border-dashed border-white/85" : "border-brand",
                  )}
                />

                {pending && (
                  <div className="absolute inset-0 grid place-items-center bg-ink/40">
                    <Loader2 className="size-8 animate-spin text-white" aria-hidden />
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-sm leading-relaxed text-muted" aria-live="polite">
                {pending
                  ? "Matching your face to your NIN, then checking you are live."
                  : stage === "camera"
                    ? "Hold still, face the light and look straight at the camera."
                    : attemptsLeft === 1
                      ? "Face sharp and inside the oval? This is your last attempt, so retake if in doubt."
                      : "Face sharp and inside the oval? Sending it uses one attempt."}
              </p>
            </>
          )}
        </div>

        <div className="border-t border-line bg-surface-2/40 px-5 py-4">
          {stage === "intro" && (
            <Button variant="brand" onClick={() => setStage("camera")} className="w-full">
              <Camera className="size-4" aria-hidden />
              Start liveness check
            </Button>
          )}

          {stage === "camera" && (
            <Button variant="brand" onClick={capture} className="w-full">
              <Camera className="size-4" aria-hidden />
              Take photo
            </Button>
          )}

          {stage === "review" && shot && (
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={pending}
                onClick={retake}
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
                {pending ? "Checking…" : "Submit"}
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
