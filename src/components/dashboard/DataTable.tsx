import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared cell recipes so the dashboard tables stay visually consistent. */
export const thCls =
  "px-5 py-3.5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-faint max-sm:px-4";
export const tdCls = "px-5 py-4 align-middle max-sm:px-4";
export const rowCls = "group cursor-pointer transition-colors hover:bg-surface-2/40";

/**
 * Dashboard table shell: a bordered card with a tinted, sticky-feeling header and
 * hairline-divided rows. Horizontally scrollable below its min width so columns never
 * crush. Pass the header row as `head` and the body rows as children.
 *
 * `minWidthClass` should be an `sm:`-prefixed min-width so it only applies from the
 * sm breakpoint up. Below sm most columns are hidden, so the table drops its min-width
 * and fits the phone viewport with no horizontal scroll.
 */
export function DataTable({
  head,
  children,
  minWidthClass = "sm:min-w-[640px]",
  className,
}: {
  head: ReactNode;
  children: ReactNode;
  minWidthClass?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-surface", className)}>
      <div className="no-scrollbar overflow-x-auto">
        <table className={cn("w-full border-collapse text-sm", minWidthClass)}>
          <thead className="border-b border-line bg-surface-2/40">{head}</thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
