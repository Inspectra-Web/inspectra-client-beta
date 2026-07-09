import { BadgeCheck, Clock, TriangleAlert } from "lucide-react";
import type { CheckState, VerificationCheck } from "@/lib/listingDetail";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

/**
 * The listing page's signature. The dossier presents the property like an audited
 * case file — the actual checks INSPECTRA ran, each with a plain-language result —
 * anchored by a dial that reads how many passed. It's the trust wedge made concrete.
 */

const TONE: Record<CheckState, { ring: string; text: string; Icon: typeof BadgeCheck; pill: string; label: string }> = {
  passed: { ring: "bg-verified/12 text-verified", text: "text-verified", Icon: BadgeCheck, pill: "text-verified", label: "Passed" },
  pending: { ring: "bg-gold/12 text-gold", text: "text-gold", Icon: Clock, pill: "text-gold", label: "In review" },
  flagged: { ring: "bg-rose-500/12 text-rose-500", text: "text-rose-500", Icon: TriangleAlert, pill: "text-rose-500", label: "Flagged" },
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
  checks: VerificationCheck[];
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">Due diligence</p>
          <h2 className="display mt-2 text-3xl text-ink max-sm:text-2xl">Verification dossier</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            Every check INSPECTRA ran on this home before it went live — the same paperwork a
            careful lawyer would demand, done for you.
          </p>
        </div>
        <TrustDial passed={passed} total={total} status={status} />
      </div>

      <ol className="mt-7 divide-y divide-line border-t border-line">
        {checks.map((c) => {
          const tone = TONE[c.state];
          return (
            <li key={c.label} className="flex gap-4 py-4">
              <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-full", tone.ring)}>
                <tone.Icon className="size-5" strokeWidth={2.2} aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="font-semibold text-ink">{c.label}</p>
                  <span className={cn("text-xs font-semibold", tone.pill)}>· {tone.label}</span>
                  {c.date && <span className="text-xs text-faint">· {c.date}</span>}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{c.result}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-xs leading-relaxed text-faint">
        Checks re-run automatically when the seller updates a document. Flagged items pause new
        inspection bookings until they're resolved.
      </p>
    </section>
  );
}

function TrustDial({ passed, total, status }: { passed: number; total: number; status: VerificationStatus }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = total ? passed / total : 0;
  const { stroke, caption } = DIAL[status];

  return (
    <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
      <div className="relative grid size-[86px] place-items-center">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-line)" strokeWidth="7" />
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
