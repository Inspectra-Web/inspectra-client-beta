import type { ReactNode } from "react";

/** Lightweight page header for dashboard routes (not the marketing SectionHeading). */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
      <div>
        <h1 className="display text-3xl text-ink max-sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
