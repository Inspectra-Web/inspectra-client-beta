import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared container shell for the two closing bands (For realtors + final CTA)
 * so they read as a matched pair: dark rounded panel, image backdrop,
 * gradient scrim and a brand glow.
 */
export function CtaBand({
  image,
  children,
  className,
}: {
  image: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-[#06121b] px-14 py-16 max-lg:px-10 max-sm:px-6 max-sm:py-12",
        className,
      )}
    >
      <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06121b] via-[#06121b]/85 to-[#06121b]/65" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/25 blur-3xl"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
