import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Base surface card for dashboard sections. Optional header (title + action). */
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-surface p-6 max-sm:p-5",
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-5 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-base font-semibold text-ink">{title}</h2>
          )}
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
