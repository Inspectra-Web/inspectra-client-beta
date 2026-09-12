import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * shadcn/ui Dialog (Radix under the hood), themed to INSPECTRA's tokens. Radix
 * handles the focus trap, Escape and the `dialog` role.
 *
 * Distinct from `ConfirmDialog`, which is an **alert**dialog: that one asks before an
 * action and cannot be dismissed by a stray click. This one holds a form, so it does
 * close on the overlay and on Escape, and it carries a close button.
 *
 * Like every Radix popup here it locks scroll through `react-remove-scroll`; the
 * unlayered `html body[data-scroll-locked]` rule in index.css is what stops the fixed
 * header shifting, and it applies to this the same way it does to Select.
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Label for the close button, so a screen reader hears what it closes. */
    closeLabel?: string;
  }
>(({ className, children, closeLabel = "Close", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
        // A form can outgrow a short viewport, so the panel scrolls rather than
        // running off the top and bottom of the screen.
        "max-h-[calc(100dvh-2rem)] overflow-y-auto",
        "rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(10,30,45,0.45)] focus:outline-none max-sm:p-5",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label={closeLabel}
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <X className="size-4" aria-hidden />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("display pr-10 text-xl text-ink", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1.5 text-sm leading-relaxed text-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
