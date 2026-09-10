import { BadgeCheck, Clock, TriangleAlert, FileQuestion } from "lucide-react";
import type { DocState, PublicDocCheck } from "@/lib/listing";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

/**
 * The listing page's signature. The dossier presents the property like an audited
 * case file — the title documents on file and where each one stands — anchored by a
 * dial that reads how many cleared. It's the trust wedge made concrete.
 *
 * The line under each document is the state, not a finding: what the reviewer wrote
 * is theirs and the realtor's, and never reaches a public payload.
 */

const TONE: Record<
  DocState,
  {
    ring: string;
    Icon: typeof BadgeCheck;
    pill: string;
    label: string;
    result: string;
  }
> = {
  verified: {
    ring: "bg-verified/12 text-verified",
    Icon: BadgeCheck,
    pill: "text-verified",
    label: "Verified",
    result: "Checked against the title on record and cleared.",
  },
  "in-review": {
    ring: "bg-gold/12 text-gold",
    Icon: Clock,
    pill: "text-gold",
    label: "In review",
    result: "Filed and waiting on an INSPECTRA reviewer.",
  },
  flagged: {
    ring: "bg-rose-500/12 text-rose-500",
    Icon: TriangleAlert,
    pill: "text-rose-500",
    label: "Flagged",
    result: "A reviewer raised a question on this document.",
  },
};

const DIAL: Record<VerificationStatus, { stroke: string; caption: string }> = {
  verified: { stroke: "var(--color-verified)", caption: "Fully verified" },
  pending: { stroke: "var(--color-gold)", caption: "Checks in progress" },
  disputed: { stroke: "#f43f5e", caption: "Dispute under review" },
};

export function VerificationDossier({
  status,
  checks,
  passed,
  total,
}: {
  status: VerificationStatus;
  checks: PublicDocCheck[];
  passed: number;
  total: number;
}) {
  return (
    <section
      aria-label="Verification dossier"
      className="mt-10 rounded-3xl border border-line bg-surface-2/40 p-7 max-sm:p-5"
    >
      <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">
            Due diligence
          </p>
          <h2 className="display mt-2 text-3xl text-ink max-sm:text-2xl">
            Verification dossier
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            The title paperwork filed for this home, and where each document stands
            — the same file a careful lawyer would demand, read for you.
          </p>
        </div>
        <TrustDial passed={passed} total={total} status={status} />
      </div>

      {checks.length > 0 ? (
        <ol className="mt-7 divide-y divide-line border-t border-line">
          {/* Two documents may legitimately share a name, so the index is the key. */}
          {checks.map((c, i) => {
            const tone = TONE[c.state];
            return (
              <li key={`${c.label}-${i}`} className="flex gap-4 py-4">
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
                    tone.ring,
                  )}
                >
                  <tone.Icon className="size-5" strokeWidth={2.2} aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="font-semibold text-ink">{c.label}</p>
                    <span className={cn("text-xs font-semibold", tone.pill)}>
                      · {tone.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{tone.result}</p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-7 flex items-center gap-4 border-t border-line pt-6">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-faint">
            <FileQuestion className="size-5" strokeWidth={2.2} aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-muted">
            No title documents have been filed for this listing yet, so nothing has been
            checked. A listing cannot be verified until its paperwork is in.
          </p>
        </div>
      )}
    </section>
  );
}

function TrustDial({
  passed,
  total,
  status,
}: {
  passed: number;
  total: number;
  status: VerificationStatus;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = total ? passed / total : 0;
  const { stroke, caption } = DIAL[status];

  return (
    <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
      <div className="relative grid size-21.5 place-items-center">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="7"
          />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute text-center">
          <span className="display text-xl leading-none text-ink">
            {passed}
            <span className="text-muted">/{total}</span>
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{caption}</p>
        <p className="mt-0.5 text-xs text-muted">checks passed</p>
      </div>
    </div>
  );
}
