import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  BadgeCheck,
  Check,
  Clock,
  FileText,
  Download,
  Share2,
  UserPlus,
  ArrowRight,
  Lock,
  GraduationCap,
  ShieldCheck,
  Play,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { CertCredential } from "@/components/realtor/CertCredential";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import {
  realtor,
  realtorPortrait,
  certification,
  type CertStatus,
} from "@/data/realtor";
import { CERT_MODULES, EXAM } from "@/data/certification";
import { cn } from "@/lib/cn";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function longMonth(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}
const today = () => new Date().toISOString().slice(0, 10);

const TOTAL = CERT_MODULES.length;

export function RealtorCertification() {
  const [status, setStatus] = useState<CertStatus>(certification.status);
  const [done, setDone] = useState(certification.completedModules);
  const [score, setScore] = useState(certification.examScore);
  const [issuedOn, setIssuedOn] = useState(certification.issuedOn);

  const enroll = () => {
    setStatus("in-progress");
    setDone(0);
    toast.success("Enrolled. Your first module is unlocked.");
  };
  const completeModule = () => {
    const next = Math.min(TOTAL, done + 1);
    setDone(next);
    toast.success(
      next === TOTAL ? "Training complete. The exam is unlocked." : "Module completed.",
    );
  };
  const takeExam = () => {
    const s = 80 + Math.floor(Math.random() * 12); // 80–91, always a pass
    setScore(s);
    setIssuedOn(today());
    setStatus("certified");
    toast.success(`You passed with ${s}%. You're certified.`);
  };
  const resetDemo = () => {
    setStatus("not-enrolled");
    setDone(0);
  };

  return status === "certified" ? (
    <CertifiedView score={score} issuedOn={issuedOn} onReset={resetDemo} />
  ) : (
    <JourneyView
      status={status}
      done={done}
      onEnroll={enroll}
      onCompleteModule={completeModule}
      onTakeExam={takeExam}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Certified — the credential hub                                      */
/* ------------------------------------------------------------------ */

function CertifiedView({
  score,
  issuedOn,
  onReset,
}: {
  score: number;
  issuedOn: string;
  onReset: () => void;
}) {
  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Certification"
          subtitle="Your INSPECTRA credential and the training behind it."
          actions={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/12 px-3 py-1 text-xs font-semibold text-gold">
              <BadgeCheck className="size-3.5" aria-hidden />
              Certified
            </span>
          }
        />
      </Reveal>

      {/* credential + standing */}
      <div className="grid grid-cols-[22rem_1fr] items-start gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="max-lg:mx-auto">
          <CertCredential
            name={realtor.name}
            photo={realtorPortrait}
            credentialId={certification.credentialId}
            issuedOn={issuedOn}
            stamp
          />
        </Reveal>

        <Reveal y={16}>
          <Panel title="Your credential" className="h-full">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 max-sm:grid-cols-1">
              <Meta label="Credential ID" value={certification.credentialId} mono />
              <Meta label="Issued" value={longMonth(issuedOn)} />
              <Meta label="Validity" value="Permanent" />
              <Meta label="Standing" value="Certified Realtor" />
            </dl>

            <p className="mt-5 flex items-start gap-2 rounded-xl bg-surface-2/50 p-3.5 text-sm text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
              Your credential is recognized on your profile and stamped on every listing you
              publish, so buyers know they're dealing with a certified realtor.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => toast.success("Credential downloaded")}
                className={buttonClasses("brand", "sm")}
              >
                <Download className="size-4" aria-hidden />
                Download credential
              </button>
              <button
                type="button"
                onClick={() => toast.success("Share link copied")}
                className={buttonClasses("outline", "sm")}
              >
                <Share2 className="size-4" aria-hidden />
                Share
              </button>
              <button
                type="button"
                onClick={() => toast.info("Added to your public profile")}
                className={buttonClasses("ghost", "sm")}
              >
                <UserPlus className="size-4" aria-hidden />
                Add to profile
              </button>
            </div>
          </Panel>
        </Reveal>
      </div>

      {/* exam result */}
      <Reveal y={16}>
        <Panel title="Exam result">
          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line max-sm:grid-cols-2">
            <ExamStat value={`${score}%`} label="Your score" highlight />
            <ExamStat value={`${EXAM.passMark}%`} label="Pass mark" />
            <ExamStat value={String(EXAM.questions)} label="Questions" />
            <ExamStat value={`${EXAM.minutes}`} label="Minutes, timed" />
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted">
            <BadgeCheck className="size-4 text-verified" aria-hidden />
            Passed on {longMonth(certification.examDate)}, well above the {EXAM.passMark}% mark.
          </p>
        </Panel>
      </Reveal>

      {/* curriculum */}
      <Reveal y={16}>
        <Panel
          title={
            <span className="flex items-center gap-2.5">
              Curriculum
              <span className="text-sm font-normal text-muted">
                {TOTAL} of {TOTAL} complete
              </span>
            </span>
          }
        >
          <ul className="divide-y divide-line">
            {CERT_MODULES.map((m) => (
              <li key={m.n} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-verified/12 text-verified">
                  <Check className="size-5" strokeWidth={2.5} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{m.title}</p>
                  <p className="credential-meta mt-0.5 flex items-center gap-3 text-[0.62rem] text-faint">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="size-3.5" aria-hidden />
                      {m.lessons} lessons
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden />
                      {m.minutes} min
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-verified">Completed</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      {/* demo affordance (no auth yet) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-muted"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset (demo)
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Not certified — the guided journey                                  */
/* ------------------------------------------------------------------ */

const STEPS = ["Enroll", "Train", "Exam", "Certified"];

function JourneyView({
  status,
  done,
  onEnroll,
  onCompleteModule,
  onTakeExam,
}: {
  status: CertStatus;
  done: number;
  onEnroll: () => void;
  onCompleteModule: () => void;
  onTakeExam: () => void;
}) {
  const enrolled = status === "in-progress";
  const trainingDone = done >= TOTAL;
  const currentStep = !enrolled ? 0 : !trainingDone ? 1 : 2;
  const pct = Math.round((done / TOTAL) * 100);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Certification"
          subtitle="Certification is required before you can list on INSPECTRA. Here's your path to the credential."
          actions={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">
              {enrolled ? "In progress" : "Not certified"}
            </span>
          }
        />
      </Reveal>

      {/* stepper */}
      <Reveal y={16}>
        <Panel>
          <ol className="flex items-center">
            {STEPS.map((label, i) => {
              const complete = i < currentStep;
              const active = i === currentStep;
              const last = i === STEPS.length - 1;
              return (
                <li key={label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full text-sm font-semibold",
                        complete
                          ? "bg-verified text-white"
                          : active
                            ? "bg-brand text-[#04121f]"
                            : "border border-line bg-surface text-faint",
                      )}
                    >
                      {complete ? (
                        <Check className="size-4" strokeWidth={3} aria-hidden />
                      ) : last ? (
                        <BadgeCheck className="size-4.5" aria-hidden />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        active ? "text-ink" : complete ? "text-verified" : "text-faint",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {!last && (
                    <span
                      className={cn("mx-2 -mt-6 h-px flex-1", i < currentStep ? "bg-verified" : "bg-line")}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </Panel>
      </Reveal>

      {!enrolled ? (
        /* enroll gate */
        <Reveal y={16}>
          <Panel>
            <div className="flex items-start gap-4 max-sm:flex-col">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink">
                <GraduationCap className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink">Get certified to start listing</h3>
                <p className="mt-1 text-sm text-muted">
                  Six self-paced modules built for the Nigerian market, then one timed exam. Pass
                  once and your credential is permanent.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button type="button" onClick={onEnroll} className={buttonClasses("brand", "md")}>
                    <Play className="size-4" aria-hidden />
                    Enroll now
                  </button>
                  <Link to="/enablement" className={buttonClasses("outline", "md")}>
                    See full program
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        </Reveal>
      ) : (
        <>
          {/* training */}
          <Reveal y={16}>
            <Panel
              title={
                <span className="flex items-center gap-2.5">
                  Training
                  <span className="text-sm font-normal text-muted">
                    {done} of {TOTAL} complete
                  </span>
                </span>
              }
            >
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <ul className="divide-y divide-line">
                {CERT_MODULES.map((m, i) => {
                  const complete = i < done;
                  const current = i === done;
                  return (
                    <li key={m.n} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full",
                          complete
                            ? "bg-verified/12 text-verified"
                            : current
                              ? "bg-brand/12 text-brand-ink"
                              : "bg-surface-2 text-faint",
                        )}
                      >
                        {complete ? (
                          <Check className="size-5" strokeWidth={2.5} aria-hidden />
                        ) : current ? (
                          <span className="display text-sm">{m.n}</span>
                        ) : (
                          <Lock className="size-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{m.title}</p>
                        <p className="credential-meta mt-0.5 flex items-center gap-3 text-[0.62rem] text-faint">
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="size-3.5" aria-hidden />
                            {m.lessons} lessons
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" aria-hidden />
                            {m.minutes} min
                          </span>
                        </p>
                      </div>
                      {complete ? (
                        <span className="shrink-0 text-xs font-semibold text-verified">Completed</span>
                      ) : current ? (
                        <button
                          type="button"
                          onClick={onCompleteModule}
                          className={buttonClasses("brand", "sm")}
                        >
                          <Play className="size-4" aria-hidden />
                          {done === 0 ? "Start" : "Resume"}
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs text-faint">Locked</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </Reveal>

          {/* exam */}
          <Reveal y={16}>
            <Panel title="Certification exam">
              <div className="flex items-start gap-4 max-sm:flex-col">
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-xl",
                    trainingDone ? "bg-brand/10 text-brand-ink" : "bg-surface-2 text-faint",
                  )}
                >
                  {trainingDone ? <GraduationCap className="size-6" /> : <Lock className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">
                    {EXAM.questions} questions · {EXAM.minutes} minutes · {EXAM.passMark}% to pass
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {trainingDone
                      ? `A timed assessment across the full syllabus. ${EXAM.retakes} free retakes if you don't clear it.`
                      : "Complete all six modules to unlock the exam."}
                  </p>
                  <button
                    type="button"
                    onClick={onTakeExam}
                    disabled={!trainingDone}
                    className={cn(buttonClasses("brand", "md"), "mt-4 disabled:opacity-50")}
                  >
                    <BadgeCheck className="size-4" aria-hidden />
                    Take exam
                  </button>
                </div>
              </div>
            </Panel>
          </Reveal>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-faint">{label}</dt>
      <dd className={cn("mt-1 font-medium text-ink", mono && "credential-meta text-sm")}>{value}</dd>
    </div>
  );
}

function ExamStat({
  value,
  label,
  highlight,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-surface p-5">
      <p className={cn("display text-3xl", highlight ? "text-foil" : "text-ink")}>{value}</p>
      <p className="credential-meta mt-2 text-[0.6rem] text-faint">{label}</p>
    </div>
  );
}
