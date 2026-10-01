import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { BadgeCheck, Check, Link2, Lock, RotateCcw, ScanFace, ShieldAlert, UserCheck } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IdentityCheckDialog } from "@/components/realtor/IdentityCheckDialog";
import { apiMessage } from "@/lib/api";
import {
  ID_LENGTH,
  idEndings,
  idError,
  useIdentity,
  useVerifyBvn,
  useVerifyNin,
} from "@/lib/identity";
import { useProfile } from "@/lib/profile";
import { cn } from "@/lib/cn";

const chip = "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/40 px-3 py-1.5";

/** Its own tab in the account: the NIN with a liveness check first, then the BVN. */
export function IdentityVerification() {
  const { data: identity, isPending } = useIdentity();
  const { data: profile } = useProfile();
  const verifyNin = useVerifyNin();
  const verifyBvn = useVerifyBvn();

  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  function startNin() {
    const rejection = idError(nin, "NIN");
    setError(rejection);
    if (rejection) return;

    setFailure(null);
    setCapturing(true);
  }

  async function onCapture(selfie: File) {
    try {
      await verifyNin.mutateAsync({ nin, selfie });
      setCapturing(false);
      setNin("");
      toast.success("Your NIN is verified. Now add your BVN.");
    } catch (err) {
      setCapturing(false);
      setFailure(apiMessage(err));
      toast.error(apiMessage(err));
    }
  }

  async function submitBvn() {
    const rejection = idError(bvn, "BVN");
    setError(rejection);
    if (rejection) return;

    setFailure(null);
    try {
      await verifyBvn.mutateAsync(bvn);
      setBvn("");
      toast.success("Your identity is verified.");
    } catch (err) {
      setFailure(apiMessage(err));
      toast.error(apiMessage(err));
    }
  }

  if (isPending || !identity)
    return <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface-2" />;

  if (identity.verified)
    return (
      <Panel title="Identity">
        <div className="flex items-center gap-4 rounded-xl border border-verified/25 bg-verified/10 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-verified/12 text-verified">
            <BadgeCheck className="size-6" strokeWidth={2.2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Identity verified</p>
            <p className="mt-0.5 text-sm text-muted">
              {idEndings(identity) || "Government ID"}, matched to {identity.legalName}.
            </p>
          </div>
        </div>

        {identity.verifiedPhoto && (
          <div className="mt-4 flex items-start gap-4 max-sm:flex-col">
            <img
              src={identity.verifiedPhoto}
              alt="The face matched to your ID"
              className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-line"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <Lock className="size-3.5 shrink-0 text-faint" aria-hidden />
                Verified photo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Kept from your check and locked. This is the face a buyer checks at an
                inspection, so it is separate from your profile picture and cannot be changed.
              </p>
            </div>
          </div>
        )}
      </Panel>
    );

  if (identity.attemptsLeft === 0)
    return (
      <Panel title="Identity">
        <div className="flex items-start gap-4 rounded-xl border border-rose-400/30 bg-rose-500/8 p-4 max-sm:flex-col">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-500/12 text-rose-500">
            <ShieldAlert className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">No attempts left</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              You have used all {identity.maxAttempts} identity checks. Contact support and we
              will review your identity with you.
            </p>
            {failure && <p className="mt-2 text-[13px] text-rose-500">{failure}</p>}
          </div>
        </div>
      </Panel>
    );

  const ninDone = identity.ninVerified;
  const profileName = [profile?.firstName, profile?.middleName, profile?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  const field = (label: "NIN" | "BVN", value: string, onChange: (next: string) => void) => (
    <div className="min-w-0 flex-1 max-sm:w-full">
      <Input
        inputMode="numeric"
        maxLength={ID_LENGTH}
        value={value}
        onChange={(e) => {
          onChange(e.target.value.replace(/\D/g, ""));
          setError(null);
        }}
        placeholder={`${ID_LENGTH}-digit ${label}`}
        aria-label={label === "NIN" ? "National Identity Number" : "Bank Verification Number"}
        aria-invalid={!!error}
        className={cn(error && "border-rose-400 focus-visible:ring-rose-400/25")}
      />
    </div>
  );

  return (
    <Panel title="Identity">
      <div className="flex items-start gap-4 max-sm:flex-col">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink">
          <ScanFace className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">Verify your identity</p>
          <p className="mt-1 text-sm text-muted">
            Two steps: your NIN with a liveness check, then your BVN.
          </p>

          <ul className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
            {!ninDone && (
              <li className={chip}>
                <UserCheck className="size-3.5 shrink-0 text-brand-ink" aria-hidden />
                Must read <span className="font-medium text-ink">{profileName || "your full name"}</span>
                <Link to="?tab=settings" className="font-medium text-brand-ink hover:underline">
                  Edit
                </Link>
              </li>
            )}
            <li className={chip}>
              <Link2 className="size-3.5 shrink-0 text-brand-ink" aria-hidden />
              Same name on NIN and BVN
            </li>
            <li className={chip}>
              <RotateCcw className="size-3.5 shrink-0 text-brand-ink" aria-hidden />
              {identity.attemptsLeft} of {identity.maxAttempts} attempts left
            </li>
          </ul>

          <ol className="mt-5 space-y-3">
            <Step n={1} title="NIN and liveness check" state={ninDone ? "done" : "active"}>
              {ninDone ? (
                <p className="text-sm text-muted">
                  NIN ending {identity.ninLast4}, matched to {identity.legalName}.
                </p>
              ) : (
                <div className="flex items-start gap-2.5 max-sm:flex-col">
                  {field("NIN", nin, setNin)}
                  <Button variant="brand" onClick={startNin} className="shrink-0 max-sm:w-full">
                    <ScanFace className="size-4" aria-hidden />
                    Continue
                  </Button>
                </div>
              )}
            </Step>

            <Step n={2} title="BVN" state={ninDone ? "active" : "upcoming"}>
              {ninDone ? (
                <div className="flex items-start gap-2.5 max-sm:flex-col">
                  {field("BVN", bvn, setBvn)}
                  <Button
                    variant="brand"
                    onClick={submitBvn}
                    disabled={verifyBvn.isPending}
                    className="shrink-0 disabled:opacity-60 max-sm:w-full"
                  >
                    {verifyBvn.isPending ? "Checking…" : "Verify BVN"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-faint">Opens once your NIN is verified.</p>
              )}
            </Step>
          </ol>

          {(error || failure) && (
            <p role="alert" className="mt-3 rounded-lg bg-rose-500/8 px-3 py-2 text-[13px] text-rose-500">
              {error ?? failure}
            </p>
          )}

          <p className="mt-3 text-xs text-faint">
            Stored encrypted for your INSPECTRA account. Never shown publicly.
          </p>
        </div>
      </div>

      <IdentityCheckDialog
        open={capturing}
        pending={verifyNin.isPending}
        attemptsLeft={identity.attemptsLeft}
        onClose={() => setCapturing(false)}
        onCapture={onCapture}
      />
    </Panel>
  );
}

function Step({
  n,
  title,
  state,
  children,
}: {
  n: number;
  title: string;
  state: "done" | "active" | "upcoming";
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        state === "active" ? "border-line bg-surface" : "border-line/60 bg-surface-2/30",
      )}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
          state === "done" && "bg-verified/15 text-verified",
          state === "active" && "bg-brand/15 text-brand-ink",
          state === "upcoming" && "bg-surface-2 text-faint",
        )}
      >
        {state === "done" ? <Check className="size-4" strokeWidth={2.6} aria-hidden /> : n}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", state === "upcoming" ? "text-faint" : "text-ink")}>
          {title}
        </p>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  );
}
