import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Check, ChevronLeft, ChevronRight, CircleAlert, Copy, Landmark } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { apiMessage } from "@/lib/api";
import { useIdentity } from "@/lib/identity";
import { useProfile } from "@/lib/profile";
import { formatDate } from "@/lib/format";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import {
  formatKobo,
  useEarnings,
  useOpenVirtualAccount,
  useVirtualAccount,
  type Balance,
  type VirtualAccount,
} from "@/lib/virtualAccount";
import { cn } from "@/lib/cn";

export function RealtorVirtualAccount() {
  const { data, isPending, isError, error } = useVirtualAccount();

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Virtual account"
          subtitle="Your own NGN account number. Inspection fees you earn are paid into it."
        />
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={Landmark}
            title="Could not load your virtual account"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
      ) : data.account?.status === "active" ? (
        <>
          <AccountDetails account={data.account} balance={data.balance} />
          <EarningsPanel />
        </>
      ) : (
        <OpenAccount />
      )}
    </div>
  );
}

function AccountDetails({ account, balance }: { account: VirtualAccount; balance: Balance | null }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the number instead.");
    }
  };

  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-lg:grid-cols-1">
      <Reveal y={16}>
        <Panel title="Account details">
          <div className="min-w-0">
            <p className="text-sm text-muted">Account number</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="display text-4xl tabular-nums tracking-wide text-ink max-sm:text-3xl">
                {account.accountNumber}
              </p>
              <button
                type="button"
                onClick={copy}
                aria-label="Copy account number"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-ink"
              >
                {copied ? <Check className="size-4 text-verified" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 max-sm:grid-cols-1">
            <Detail label="Account name" value={account.accountName} />
            <Detail label="Bank" value={account.bankName} />
            <Detail label="Currency" value={account.currency} />
            {account.activatedAt && <Detail label="Opened" value={formatDate(account.activatedAt)} />}
          </dl>
        </Panel>
      </Reveal>

      <Reveal y={16}>
        <Panel title="Balance">
          {balance ? (
            <>
              <p className="text-sm text-muted">Available</p>
              <p className="display mt-1 text-4xl tabular-nums text-ink max-sm:text-3xl">
                {formatKobo(balance.available)}
              </p>
              {balance.booked !== balance.available && (
                <p className="mt-3 text-sm text-muted">
                  {formatKobo(balance.booked)} including payments still clearing.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Your balance is not available right now.</p>
          )}
          <p className="mt-6 border-t border-line pt-4 text-sm text-faint">
            Withdrawals to your bank account are coming soon.
          </p>
        </Panel>
      </Reveal>
    </div>
  );
}

/**
 * Inspection fees that have actually landed, from the ledger, and what buyers have paid
 * that is still on its way. Nothing here is projected: a fee appears once its transfer
 * succeeded, and a disputed one appears in neither figure until it is decided.
 */
function EarningsPanel() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, isPlaceholderData } = useEarnings(page);

  return (
    <Reveal y={16}>
      <Panel title="Inspection fees">
        {isError ? (
          <p className="text-sm text-muted">{apiMessage(error, "Could not load your inspection fees.")}</p>
        ) : isPending ? (
          <div className="h-32 animate-pulse rounded-xl bg-surface-2/60" />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <div className="rounded-xl border border-line bg-surface-2/40 p-4">
                <dt className="text-sm text-muted">Paid to you</dt>
                <dd className="display mt-1 text-2xl tabular-nums text-ink">{formatKobo(data.earned)}</dd>
                <dd className="mt-0.5 text-xs text-faint">
                  {data.total} {data.total === 1 ? "viewing" : "viewings"}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-surface-2/40 p-4">
                <dt className="text-sm text-muted">Held for you</dt>
                <dd className="display mt-1 text-2xl tabular-nums text-ink">{formatKobo(data.held.kobo)}</dd>
                <dd className="mt-0.5 text-xs text-faint">
                  Paid by buyers, released once each viewing is confirmed
                </dd>
              </div>
            </dl>

            {data.earnings.length === 0 ? (
              <p className="mt-5 text-sm text-muted">
                No inspection fees paid out yet. They appear here as each paid viewing is confirmed.
              </p>
            ) : (
              <DataTable
                className={cn("mt-5 transition-opacity", isPlaceholderData && "opacity-60")}
                minWidthClass="sm:min-w-[620px]"
                head={
                  <tr>
                    <th className={thCls}>Listing</th>
                    <th className={cn(thCls, "max-md:hidden")}>Viewing</th>
                    <th className={thCls}>Paid</th>
                    <th className={cn(thCls, "text-right")}>Amount</th>
                  </tr>
                }
              >
                {data.earnings.map((e) => (
                  <tr
                    key={e.id}
                    className={rowCls}
                    onClick={() => e.inspection && navigate(`/realtor/inspections/${e.inspection}`)}
                  >
                    <td className={tdCls}>
                      <p className="truncate font-medium text-ink">{e.property || "Removed listing"}</p>
                      <p className="truncate text-xs text-faint">{e.reference}</p>
                    </td>
                    <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>
                      {e.slot ? formatDate(e.slot) : ""}
                    </td>
                    <td className={cn(tdCls, "text-sm text-muted")}>{formatDate(e.paidAt)}</td>
                    <td className={cn(tdCls, "text-right font-medium tabular-nums text-ink")}>
                      {formatKobo(e.amount)}
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}

            {data.pages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Previous
                </Button>
                <span className="text-sm tabular-nums text-muted">
                  Page {data.page} of {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            )}
          </>
        )}
      </Panel>
    </Reveal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-ink">{value}</dd>
    </div>
  );
}

function OpenAccount() {
  const identity = useIdentity();
  const profile = useProfile();
  const open = useOpenVirtualAccount();
  const [consent, setConsent] = useState(false);

  const verified = identity.data?.verified ?? false;
  const bothNumbers = Boolean(identity.data?.ninLast4 && identity.data?.bvnLast4);
  const hasAddress = Boolean(profile.data?.address.trim());

  const steps = [
    {
      done: verified,
      label: "Verify your identity",
      to: "/realtor/account?tab=identity",
    },
    {
      done: verified && bothNumbers,
      label: "Have both your NIN and BVN on record",
      to: "/realtor/account?tab=identity",
    },
    {
      done: hasAddress,
      label: "Add your home address",
      to: "/realtor/account?tab=settings",
    },
  ];

  const ready = steps.every((step) => step.done);
  const loading = identity.isPending || profile.isPending;

  const submit = () =>
    open.mutate(undefined, {
      onSuccess: () => toast.success("Your virtual account is open."),
      onError: (err) => toast.error(apiMessage(err, "We could not open your virtual account.")),
    });

  return (
    <Reveal y={16}>
      <Panel className="max-w-2xl">
        <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
          <Landmark className="size-6" />
        </span>
        <h2 className="display mt-5 text-2xl text-ink">Open your virtual account</h2>
        <p className="mt-2 text-muted">
          An NGN account number in your name. When a buyer pays for an inspection, the fee is
          held until the viewing happens, then paid into this account.
        </p>

        <ul className="mt-6 space-y-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  step.done ? "bg-verified/15 text-verified" : "bg-surface-2 text-faint",
                )}
              >
                {step.done ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}
              </span>
              <span className={step.done ? "text-ink" : "text-muted"}>{step.label}</span>
              {!loading && !step.done && (
                <Link to={step.to} className="ml-auto font-medium text-brand hover:underline">
                  Fix this
                </Link>
              )}
            </li>
          ))}
        </ul>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 p-4 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={!ready}
            className="mt-0.5 size-4 accent-[#1AACF0]"
          />
          <span className="text-muted">
            I agree that INSPECTRA opens an NGN account in my name using my verified BVN and NIN,
            and holds it on my behalf.
          </span>
        </label>

        <Button
          type="button"
          variant="brand"
          className="mt-6"
          onClick={submit}
          disabled={!ready || !consent || open.isPending}
        >
          {open.isPending ? "Opening your account..." : "Open account"}
        </Button>

        {!loading && !ready && (
          <p className="mt-3 text-sm text-faint">Finish the steps above to open your account.</p>
        )}
      </Panel>
    </Reveal>
  );
}

