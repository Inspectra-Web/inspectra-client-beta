import { BadgeCheck, Clock, TriangleAlert } from "lucide-react";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

const map = {
  verified: {
    label: "Verified",
    Icon: BadgeCheck,
    tone: "text-verified border-verified/30 bg-verified/12",
  },
  pending: {
    label: "Pending",
    Icon: Clock,
    tone: "text-pending border-pending/30 bg-pending/12",
  },
  disputed: {
    label: "Disputed",
    Icon: TriangleAlert,
    tone: "text-disputed border-disputed/30 bg-disputed/12",
  },
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
  const { label, Icon, tone } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        onPhoto ? "border-white/20 bg-white/95 text-slate-900 shadow-sm" : tone,
        className,
      )}
    >
      <Icon
        className={cn("size-3.5", onPhoto && statusPhotoColor(status))}
        strokeWidth={2.5}
        aria-hidden
      />
      {label}
    </span>
  );
}

function statusPhotoColor(status: VerificationStatus) {
  return status === "verified"
    ? "text-emerald-600"
    : status === "pending"
      ? "text-amber-600"
      : "text-rose-600";
}
