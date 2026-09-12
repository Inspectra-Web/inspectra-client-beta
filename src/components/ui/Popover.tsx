import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

/**
 * shadcn/ui Popover (Radix under the hood), themed to INSPECTRA's tokens so the
 * panel reads as part of the product rather than a browser-native control. Matches
 * Select's surface, border and shadow, since the two sit side by side in a form.
 *
 * Note the scroll-lock rule in index.css: like Select, this locks scroll while open,
 * and the unlayered `html body[data-scroll-locked]` override is what stops the fixed
 * header shifting and the next control needing two clicks.
 */
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 6, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-auto rounded-xl border border-line bg-surface p-3 text-ink outline-none shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
