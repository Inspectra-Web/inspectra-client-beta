import { Check, Clock, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { verificationSteps, type Agency, type StepState } from "@/lib/agency";

/**
 * How far a realtor has got through their checks, drawn as one line rather than a row of
 * separate badges. The rungs genuinely are a sequence: identity gates the other two, so
 * scattered chips misrepresented it.
 *
 * Deliberately not the inspection Timeline, which is bound to InspectionStatus and whose
 * terminal states replace a step. Same visual idiom, so the two read as one system.
 */
const ICON: Record<StepState, typeof Check> = {
  done: Check,
  waiting: Clock,
  alert: X,
  todo: Check,
};

const DOT: Record<StepState, string> = {
  done: "bg-verified text-white",
  waiting: "bg-amber-500 text-white",
  alert: "bg-rose-500 text-white",
  todo: "border border-line bg-surface text-faint",
};

const LINE: Record<StepState, string> = {
  done: "bg-verified",
  waiting: "bg-amber-500",
  alert: "bg-rose-500",
  todo: "bg-line",
};

export function VerificationTimeline({
  identityVerified,
  agency,
}: {
  identityVerified: boolean;
  agency: Agency | undefined;
}) {
  const steps = verificationSteps(identityVerified, agency);

  return (
    <ol className="flex items-center">
      {steps.map((step, i) => {
        const next = steps[i + 1];
        const Icon = ICON[step.state];

        return (
          <li key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn("grid size-8 place-items-center rounded-full", DOT[step.state])}
              >
                {step.state === "todo" ? (
                  <span className="size-2 rounded-full bg-current" />
                ) : (
                  <Icon className="size-4" strokeWidth={3} aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  step.state === "todo" ? "text-faint" : "text-ink",
                )}
              >
                {step.label}
              </span>
            </div>
            {next && <span className={cn("mx-2 -mt-6 h-px flex-1", LINE[next.state])} />}
          </li>
        );
      })}
    </ol>
  );
}
