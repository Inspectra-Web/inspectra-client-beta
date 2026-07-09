import { BadgeCheck, Clock, TriangleAlert } from "lucide-react";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

const map = {
  verified: { label: "Verified", Icon: BadgeCheck, tone: "text-verified", photoIcon: "text-emerald-600" },
  pending: { label: "Pending", Icon: Clock, tone: "text-gold", photoIcon: "text-amber-600" },
  disputed: { label: "Disputed", Icon: TriangleAlert, tone: "text-rose-500", photoIcon: "text-rose-600" },
} as const;

export function StatusBadge({
  status,
  className,
  /** Use on top of photography — solid backing for legibility. */
  onPhoto = false,
}: {
  status: VerificationStatus;
  className?: string;
  onPhoto?: boolean;
}) {
  const { label, Icon, tone, photoIcon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold",
        onPhoto
          ? "bg-white/95 px-2.5 py-1 text-slate-900 shadow-sm ring-1 ring-black/5"
          : cn("border border-line bg-surface px-2.5 py-1", tone),
        className,
      )}
    >
      <Icon className={cn("size-3.5", onPhoto ? photoIcon : "")} strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}
