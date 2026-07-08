import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <span className="eyebrow flex items-center gap-2">
        <span className="inline-block h-px w-6 bg-cyan/60" aria-hidden />
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "max-w-xl text-[0.975rem] leading-relaxed text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
