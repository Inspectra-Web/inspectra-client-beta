import { toast } from "react-toastify";
import { BadgeCheck, Clock, TriangleAlert, Upload, Eye, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import type { DocCheck, DocState } from "@/lib/listing";
import { cn } from "@/lib/cn";

const TONE: Record<
  DocState,
  { ring: string; pill: string; Icon: typeof BadgeCheck; label: string }
> = {
  verified: { ring: "bg-verified/12 text-verified", pill: "text-verified", Icon: BadgeCheck, label: "Verified" },
  "in-review": { ring: "bg-gold/12 text-gold", pill: "text-gold", Icon: Clock, label: "In review" },
  flagged: { ring: "bg-rose-500/12 text-rose-500", pill: "text-rose-500", Icon: TriangleAlert, label: "Action needed" },
  missing: { ring: "bg-surface-2 text-faint", pill: "text-faint", Icon: Upload, label: "Not submitted" },
};

/** A document checklist for a listing. Pass `actions` to show upload/resubmit/view buttons. */
export function DocCheckList({
  checks,
  actions = false,
}: {
  checks: DocCheck[];
  actions?: boolean;
}) {
  return (
    <ul className="divide-y divide-line">
      {checks.map((c) => {
        const tone = TONE[c.state];
        return (
          <li key={c.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", tone.ring)}>
              <tone.Icon className="size-5" strokeWidth={2.2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{c.label}</p>
              <p className={cn("text-xs font-semibold", tone.pill)}>{tone.label}</p>
            </div>
            {actions && <DocAction state={c.state} doc={c.label} />}
          </li>
        );
      })}
    </ul>
  );
}

function DocAction({ state, doc }: { state: DocState; doc: string }) {
  if (state === "missing")
    return (
      <button
        type="button"
        onClick={() => toast.info(`Upload flow for “${doc}” is coming soon.`)}
        className={buttonClasses("brand", "sm")}
      >
        <Upload className="size-4" aria-hidden />
        Upload
      </button>
    );

  if (state === "flagged")
    return (
      <button
        type="button"
        onClick={() => toast.info(`Resubmit flow for “${doc}” is coming soon.`)}
        className={buttonClasses("outline", "sm")}
      >
        <RotateCcw className="size-4" aria-hidden />
        Resubmit
      </button>
    );

  return (
    <button
      type="button"
      onClick={() => toast.info(`Preview for “${doc}” is coming soon.`)}
      className={buttonClasses("ghost", "sm")}
    >
      <Eye className="size-4" aria-hidden />
      View
    </button>
  );
}
