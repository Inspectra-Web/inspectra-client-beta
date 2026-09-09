import { useState } from "react";
import { BadgeCheck, Clock, TriangleAlert, Eye } from "lucide-react";
import { DocumentViewer } from "@/components/listing/DocumentViewer";
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
};

/**
 * A listing's document checklist. Pass `actions` for a View button that opens the file
 * in place. Replacing a flagged document happens in the listing editor, which owns the
 * upload, so nothing here has to pretend it can.
 */
export function DocCheckList({
  checks,
  actions = false,
}: {
  checks: DocCheck[];
  actions?: boolean;
}) {
  const [reading, setReading] = useState<DocCheck | null>(null);

  return (
    <>
      <ul className="divide-y divide-line">
        {checks.map((c) => {
          const tone = TONE[c.state];
          return (
            <li key={c.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", tone.ring)}>
                <tone.Icon className="size-5" strokeWidth={2.2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{c.label}</p>
                <p className={cn("text-xs font-semibold", tone.pill)}>{tone.label}</p>
                {c.reason && <p className="mt-1 text-sm text-muted">{c.reason}</p>}
              </div>
              {actions && (
                <button
                  type="button"
                  onClick={() => setReading(c)}
                  className={buttonClasses("ghost", "sm")}
                >
                  <Eye className="size-4" aria-hidden />
                  View
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <DocumentViewer
        open={reading !== null}
        onClose={() => setReading(null)}
        title={reading?.label ?? ""}
        path={reading?.path ?? ""}
      />
    </>
  );
}
