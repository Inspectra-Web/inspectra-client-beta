import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2 } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Asks before an action that is awkward to undo. Radix handles the focus trap,
 * Escape, and the alertdialog role, so the choice cannot be dismissed by a
 * stray click the way a toast can.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  async function handleConfirm(event: React.MouseEvent) {
    // Radix closes on click by default. Hold it open while the work runs so the
    // spinner is visible, then close whatever the outcome.
    event.preventDefault();

    try {
      await onConfirm();
    } finally {
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
        <AlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(10,30,45,0.45)]",
            "focus:outline-none",
          )}
        >
          <AlertDialog.Title className="display text-xl text-ink">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2 max-sm:flex-col-reverse">
            <AlertDialog.Cancel asChild>
              <button type="button" disabled={pending} className={cn(buttonClasses("outline", "md"), "disabled:opacity-60")}>
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className={cn(
                  buttonClasses(destructive ? "outline" : "brand", "md"),
                  "min-w-32 disabled:opacity-60",
                  destructive &&
                    "border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15",
                )}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  confirmLabel
                )}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
