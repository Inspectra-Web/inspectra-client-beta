import { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  BadgeCheck,
  Building2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  ScanFace,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { apiMessage } from "@/lib/api";
import { useIdentity } from "@/lib/identity";
import {
  BILL_ACCEPT,
  COMPANY_TYPES,
  RC_MAX,
  companyTypeLabel,
  rcError,
  billError,
  meterError,
  useAgency,
  useSubmitAddress,
  useVerifyCac,
  type CompanyType,
} from "@/lib/agency";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

function Cleared({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-verified/25 bg-verified/10 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-verified/12 text-verified">
        <BadgeCheck className="size-6" strokeWidth={2.2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}

/**
 * An error belongs to the control that caused it, or to the form when the server rejected
 * the whole submission. One shared string rendered in one place put "choose a type" under
 * the button while the number field turned red.
 */
type Field<T extends string> = { field: T | "form"; message: string } | null;

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-1.5 text-[13px] text-rose-500">
      {message}
    </p>
  );
}

/** Both checks need a verified person behind them, so neither form opens without one. */
function NeedsIdentity() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-line bg-surface-2/40 p-4 max-sm:flex-col">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint">
        <ScanFace className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">Verify your identity first</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Clear the Identity check on the tab before this one, then come back.
        </p>
      </div>
    </div>
  );
}

function CacCheck({ ready }: { ready: boolean }) {
  const { data: agency } = useAgency();
  const verify = useVerifyCac();

  const [rc, setRc] = useState("");
  const [type, setType] = useState<CompanyType | "">("");
  const [error, setError] = useState<Field<"rc" | "type">>(null);

  const cac = agency?.cac;

  async function submit() {
    const rejection = rcError(rc);

    if (rejection) {
      setError({ field: "rc", message: rejection });
      return;
    }

    if (!type) {
      setError({ field: "type", message: "Choose how the business is registered" });
      return;
    }

    setError(null);

    try {
      await verify.mutateAsync({ rcNumber: rc, companyType: type });
      setRc("");
      setType("");
      toast.success("Your business registration is verified.");
    } catch (err) {
      setError({ field: "form", message: apiMessage(err) });
      toast.error(apiMessage(err));
    }
  }

  if (cac?.verified)
    return (
      <Panel title="Business registration">
        <Cleared title="Business registered">
          {cac.companyName}, {companyTypeLabel(cac.companyType)} RC {cac.rcNumber}
          {cac.registeredOn ? `, registered ${formatDate(cac.registeredOn)}` : ""}.
        </Cleared>
        {cac.registeredAddress && (
          <p className="mt-3 text-sm text-muted">
            <span className="font-medium text-ink">Registered address.</span>{" "}
            {cac.registeredAddress}
          </p>
        )}
      </Panel>
    );

  return (
    <Panel title="Business registration">
      {!ready ? (
        <NeedsIdentity />
      ) : (
        <div className="flex items-start gap-4 max-sm:flex-col">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink">
            <Building2 className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Verify your business</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Enter the RC number your agency is registered under. Your name has to appear
              on the registration, so a business you only work for will not clear.
            </p>

            <div className="mt-4 grid grid-cols-[1fr_1.1fr] items-start gap-2.5 max-sm:grid-cols-1">
              <div className="min-w-0">
                <Input
                  inputMode="numeric"
                  maxLength={RC_MAX}
                  value={rc}
                  onChange={(e) => {
                    setRc(e.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  placeholder="RC number"
                  aria-label="RC number"
                  aria-invalid={error?.field === "rc"}
                  className={cn(
                    "min-w-0",
                    error?.field === "rc" &&
                      "border-rose-400 focus-visible:ring-rose-400/25",
                  )}
                />
                {error?.field === "rc" && <FieldError message={error.message} />}
              </div>

              <div className="min-w-0">
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value as CompanyType);
                    setError(null);
                  }}
                >
                  <SelectTrigger
                    aria-label="Registration type"
                    aria-invalid={error?.field === "type"}
                    className={cn(
                      "min-w-0",
                      error?.field === "type" &&
                        "border-rose-400 focus-visible:ring-rose-400/25",
                    )}
                  >
                    <SelectValue placeholder="Registration type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error?.field === "type" && <FieldError message={error.message} />}
              </div>
            </div>

            {error?.field === "form" && <FieldError message={error.message} />}

            <Button
              variant="brand"
              onClick={submit}
              disabled={verify.isPending}
              className="mt-3 max-sm:w-full"
            >
              {verify.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Building2 className="size-4" aria-hidden />
              )}
              Verify business
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function AddressCheck({ ready }: { ready: boolean }) {
  const { data: agency } = useAgency();
  const submit = useSubmitAddress();
  const fileRef = useRef<HTMLInputElement>(null);

  const [meter, setMeter] = useState("");
  const [bill, setBill] = useState<File | null>(null);
  const [error, setError] = useState<Field<"meter" | "bill">>(null);

  const address = agency?.address;
  const status = address?.status ?? "unsubmitted";

  function choose(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const rejection = billError(file);
    if (rejection) {
      setError({ field: "bill", message: rejection });
      return;
    }

    setBill(file);
    setError(null);
  }

  async function send() {
    const rejection = meterError(meter);

    if (rejection) {
      setError({ field: "meter", message: rejection });
      return;
    }

    if (!bill) {
      setError({ field: "bill", message: "Attach the bill" });
      return;
    }

    setError(null);

    try {
      const res = await submit.mutateAsync({ bill, meterNumber: meter });
      setMeter("");
      setBill(null);
      toast.success(res.message ?? "Your bill is with our team.");
    } catch (err) {
      setError({ field: "form", message: apiMessage(err) });
      toast.error(apiMessage(err));
    }
  }

  if (status === "verified" && address)
    return (
      <Panel title="Business address">
        <Cleared title="Address verified">
          Meter {address.meterNumber}
          {address.verifiedOn ? `, checked ${formatDate(address.verifiedOn)}` : ""}.
        </Cleared>
      </Panel>
    );

  if (status === "in-review" && address)
    return (
      <Panel title="Business address">
        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2/40 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint">
            <Clock className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">With our team</p>
            <p className="mt-0.5 text-sm text-muted">
              Meter {address.meterNumber}
              {address.submittedOn ? `, sent ${formatDate(address.submittedOn)}` : ""}.
            </p>
          </div>
        </div>
       
      </Panel>
    );

  return (
    <Panel title="Business address">
      {!ready ? (
        <NeedsIdentity />
      ) : (
        <div className="flex items-start gap-4 max-sm:flex-col">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink">
            <MapPin className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Verify your address</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Send a utility bill for the address you trade from, dated within the last
              three months, with its meter or account number.
            </p>

            {status === "flagged" && address?.reason && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    Your last bill was not accepted
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{address.reason}</p>
                </div>
              </div>
            )}

            <Input
              value={meter}
              onChange={(e) => {
                setMeter(e.target.value);
                setError(null);
              }}
              placeholder="Meter or account number"
              aria-label="Meter or account number"
              aria-invalid={error?.field === "meter"}
              className={cn(
                "mt-4 min-w-0",
                error?.field === "meter" &&
                  "border-rose-400 focus-visible:ring-rose-400/25",
              )}
            />
            {error?.field === "meter" && <FieldError message={error.message} />}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed",
                "bg-surface-2/40 px-4 py-5 text-sm font-medium text-muted transition-colors",
                "hover:border-brand/40 hover:text-ink",
                error?.field === "bill" ? "border-rose-400" : "border-line",
              )}
            >
              {bill ? (
                <>
                  <FileText className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{bill.name}</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" aria-hidden />
                  Attach the bill
                </>
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept={BILL_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                choose(e.target.files);
                e.target.value = "";
              }}
            />

            {(error?.field === "bill" || error?.field === "form") && (
              <FieldError message={error.message} />
            )}

            <Button
              variant="brand"
              onClick={send}
              disabled={submit.isPending}
              className="mt-3 max-sm:w-full"
            >
              {submit.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <MapPin className="size-4" aria-hidden />
              )}
              Send for review
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}


/** The practice half of a realtor's checks: the business, then where it trades from. */
export function AgencyVerification() {
  const { data: identity, isPending: loadingIdentity } = useIdentity();
  const { isPending: loadingAgency } = useAgency();

  if (loadingIdentity || loadingAgency)
    return <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface-2" />;

  const ready = identity?.verified === true;

  return (
    <div className="space-y-5">
      <CacCheck ready={ready} />
      <AddressCheck ready={ready} />
    </div>
  );
}
