import { Check, X } from "lucide-react";

import { cn } from "@/lib/cn";
import type { InspectionStatus, Party } from "@/lib/inspections";

/**
 * Where a booking has got to. Both consoles read the same record, so both render
 * this: it used to be copied verbatim into each detail page, which is how the two
 * of them drifted apart in the mock.
 *
 * The happy path is three steps, and the two terminal states replace the last one
 * rather than adding a fourth. A viewing that was declined never reached a third
 * step, and a cancelled one stopped wherever it was, so drawing a greyed "Completed"
 * after them would suggest it is still coming.
 */
type Step = { label: string; done: boolean; alert?: boolean };

const steps = (status: InspectionStatus, cancelledBy?: Party): Step[] => {
  if (status === "declined")
    return [
      { label: "Requested", done: true },
      { label: "Declined", done: true, alert: true },
    ];

  if (status === "cancelled")
    return [
      { label: "Requested", done: true },
      {
        // Who called it off is the whole story of a cancellation, and it is the
        // question the buyer asks first.
        label: cancelledBy === "realtor" ? "Cancelled by realtor" : "Cancelled",
        done: true,
        alert: true,
      },
    ];

  return [
    { label: "Requested", done: true },
    { label: "Confirmed", done: status !== "requested" },
    {
      label: status === "completed" ? "Completed" : "Awaiting visit",
      done: status === "completed",
    },
  ];
};

export function Timeline({
  status,
  cancelledBy,
}: {
  status: InspectionStatus;
  cancelledBy?: Party;
}) {
  const list = steps(status, cancelledBy);

  return (
    <ol className="flex items-center">
      {list.map((step, i) => {
        const next = list[i + 1];

        return (
          <li key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full text-white",
                  step.alert
                    ? "bg-rose-500"
                    : step.done
                      ? "bg-verified"
                      : "border border-line bg-surface text-faint",
                )}
              >
                {step.alert ? (
                  <X className="size-4" strokeWidth={3} aria-hidden />
                ) : step.done ? (
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                ) : (
                  <span className="size-2 rounded-full bg-current" />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  step.done ? "text-ink" : "text-faint",
                )}
              >
                {step.label}
              </span>
            </div>
            {next && (
              <span
                className={cn(
                  "mx-2 -mt-6 h-px flex-1",
                  next.alert ? "bg-rose-500" : next.done ? "bg-verified" : "bg-line",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
