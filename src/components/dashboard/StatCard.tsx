import type { ComponentType } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
}

/** A single metric tile. Links to its detail page when `to` is given. */
export function StatCard({ icon: Icon, label, value, hint, to }: StatCardProps) {
  const inner = (
    <div
      className={cn(
        "group h-full rounded-2xl border border-line bg-surface p-5 transition-all duration-300",
        to &&
          "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand-ink">
          <Icon className="size-5" />
        </span>
        {to && (
          <ArrowUpRight className="size-4 text-faint transition-colors group-hover:text-brand-ink" />
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {hint && <p className="mt-2 text-xs text-faint">{hint}</p>}
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
