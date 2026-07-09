import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * shadcn/ui Input, adapted to INSPECTRA's semantic tokens (bg-surface / border-line /
 * text-ink) and pill radius. Pass `className` to override for on-photo / glass contexts.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-full border border-line bg-surface px-4 text-sm text-ink transition-colors",
        "placeholder:text-faint",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
