import { useState } from "react";
import { toast } from "react-toastify";
import { BadgeCheck, Lock, ScanFace } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IdentityCheckDialog } from "@/components/realtor/IdentityCheckDialog";
import { apiMessage } from "@/lib/api";
import {
  ID_DOCUMENTS,
  ID_LENGTH,
  documentLabel,
  idError,
  useIdentity,
  useVerifyIdentity,
  type IdDocument,
} from "@/lib/identity";
import { cn } from "@/lib/cn";

/** Its own tab in the account: one number, one selfie, one answer. */
export function IdentityVerification() {
  const { data: identity, isPending } = useIdentity();
  const verify = useVerifyIdentity();

  const [doc, setDoc] = useState<IdDocument>("nin");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  function start() {
    const rejection = idError(value, doc);
    setError(rejection);
    if (rejection) return;

    setCapturing(true);
  }

  async function onCapture(selfie: File) {
    try {
      await verify.mutateAsync({ document: doc, number: value, selfie });
      setCapturing(false);
      setValue("");
      toast.success("Your identity is verified.");
    } catch (err) {
      setCapturing(false);
      setError(apiMessage(err));
      toast.error(apiMessage(err));
    }
  }

  if (isPending)
    return <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface-2" />;

  if (identity?.verified)
    return (
      <Panel title="Identity">
        <div className="flex items-center gap-4 rounded-xl border border-verified/25 bg-verified/10 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-verified/12 text-verified">
            <BadgeCheck className="size-6" strokeWidth={2.2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Identity verified</p>
            <p className="mt-0.5 text-sm text-muted">
              {identity.document ? documentLabel(identity.document) : "Government ID"} ending{" "}
              {identity.last4}, matched to {identity.legalName}.
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

  return (
    <Panel title="Identity">
      <div className="flex items-start gap-4 max-sm:flex-col">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink">
          <ScanFace className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">Verify your identity</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Enter your NIN or BVN, then take a selfie. The name on your ID has to match the
            name on your account.
          </p>

          <div
            role="group"
            aria-label="Choose a document"
            className="mt-4 inline-flex items-center gap-1 rounded-full border border-line bg-surface-2/50 p-1"
          >
            {ID_DOCUMENTS.map((d) => {
              const active = doc === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setDoc(d.key);
                    setError(null);
                  }}
                  className={cn(
                    "h-8 rounded-full px-4 text-sm font-medium transition-colors",
                    active ? "bg-ink text-bg" : "text-muted hover:text-ink",
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-2.5 max-sm:flex-col">
            <div className="min-w-0 flex-1 max-sm:w-full">
              <Input
                inputMode="numeric"
                maxLength={ID_LENGTH}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
                placeholder={`${ID_LENGTH}-digit ${doc.toUpperCase()}`}
                aria-label={documentLabel(doc)}
                aria-invalid={!!error}
                className={cn(error && "border-rose-400 focus-visible:ring-rose-400/25")}
              />
            </div>
            <Button variant="brand" onClick={start} className="shrink-0 max-sm:w-full">
              <ScanFace className="size-4" aria-hidden />
              Continue
            </Button>
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-[13px] text-rose-500">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs text-faint">
              Your number is never stored in full and never shown on your public profile.
            </p>
          )}
        </div>
      </div>

      <IdentityCheckDialog
        open={capturing}
        pending={verify.isPending}
        onClose={() => setCapturing(false)}
        onCapture={onCapture}
      />
    </Panel>
  );
}
