import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, GraduationCap, Search, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTable, rowCls, tdCls, thCls } from "@/components/dashboard/DataTable";
import { CourseTabs } from "@/components/course/CourseTabs";
import {
  ENROLLMENTS_PAGE_SIZE,
  useAdminEnrollments,
  useEnrollmentRewardPreview,
  useSendEnrollmentReward,
  type Enrollment,
  type EnrollmentFilter,
  type EnrollmentsQuery,
  type ReferralFilter,
} from "@/lib/course";
import { formatDate, formatPhone, formatPriceFull } from "@/lib/format";
import { formatTokenAmount } from "@/lib/wallet";
import { apiMessage } from "@/lib/api";
import { cn } from "@/lib/cn";

const FILTERS: { value: EnrollmentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Opened by a guest" },
];

const REFERRAL_FILTERS: { value: ReferralFilter; label: string }[] = [
  { value: "all", label: "Any source" },
  { value: "referred", label: "Referred" },
  { value: "direct", label: "Direct" },
];

const PLANBOK_TRANSFER_FEE = 15;

/** Money to the kobo, always two places: "₦10,263.12", "₦26.88". */
const formatNaira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminCourseEnrollments() {
  const [query, setQuery] = useState<EnrollmentsQuery>({ q: "", status: "all", referral: "all", page: 1 });
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  // The row as it was when opened, replaced by the live row from the list whenever there is one.
  const [opened, setOpened] = useState<Enrollment | null>(null);
  const [moving, setMoving] = useState(false);
  const { data, isPending, isError, isPlaceholderData } = useAdminEnrollments(query, moving);
  const rows = data?.enrollments ?? [];
  const open = opened && (rows.find((row) => row.id === opened.id) ?? opened);

  useEffect(() => setMoving(!!open && rewardMoving(open)), [open]);
  const filtered = query.q !== "" || query.status !== "all" || query.referral !== "all";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
          Realtor acquisition
        </p>
        <h1 className="display mt-1 text-3xl text-ink max-sm:text-2xl">Enrollments</h1>
      </header>

      <CourseTabs />


      <div className="flex items-start justify-between gap-4 max-lg:flex-col max-lg:items-stretch">
        <div className="space-y-3">
          <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => (
              <FilterPill
                key={value}
                label={label}
                count={data?.counts[value]}
                active={query.status === value}
                onClick={() => setQuery((prev) => ({ ...prev, status: value, page: 1 }))}
              />
            ))}
          </div>
          <div role="tablist" aria-label="Filter by referral" className="flex flex-wrap gap-2">
            {REFERRAL_FILTERS.map(({ value, label }) => (
              <FilterPill
                key={value}
                label={label}
                count={data?.referrals[value]}
                active={query.referral === value}
                onClick={() => setQuery((prev) => ({ ...prev, referral: value, page: 1 }))}
                small
              />
            ))}
          </div>
        </div>

        <div className="relative w-80 max-lg:w-full">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <Input
            type="search"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Search name, email or phone"
            aria-label="Search enrollments"
            className="h-10 pl-11"
          />
        </div>
      </div>

      {isError ? (
        <EmptyState
          icon={GraduationCap}
          title="Enrollments did not load"
          message="Refresh the page to try again."
        />
      ) : isPending ? (
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-surface-2/50" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={filtered ? "No one matches" : "No enrollments yet"}
          message={
            filtered
              ? "Nobody fits that search and those filters. Clear the search or pick other filters."
              : "When a realtor pays for the course, they appear here."
          }
        />
      ) : (
        <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
          <DataTable
            minWidthClass="sm:min-w-[760px]"
            head={
              <tr>
                <th className={cn(thCls, "w-14")}>S/N</th>
                <th className={thCls}>Realtor</th>
                <th className={cn(thCls, "whitespace-nowrap max-md:hidden")}>Paid on</th>
                <th className={thCls}>Progress</th>
                <th className={cn(thCls, "whitespace-nowrap max-md:hidden")}>Token reward</th>
              </tr>
            }
          >
            {rows.map((enrollment, i) => (
              <tr key={enrollment.id} className={rowCls} onClick={() => setOpened(enrollment)}>
                <td className={cn(tdCls, "tabular-nums text-faint")}>
                  {(query.page - 1) * ENROLLMENTS_PAGE_SIZE + i + 1}
                </td>
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={enrollment.fullname} avatar="" className="size-8" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2">
                        <span className="truncate font-medium capitalize text-ink">{enrollment.fullname}</span>
                        {enrollment.referral && <ReferredBadge />}
                      </p>
                      <p className="truncate text-xs text-faint">{enrollment.email}</p>
                    </div>
                  </div>
                </td>
                <td className={cn(tdCls, "whitespace-nowrap text-muted max-md:hidden")}>
                  {enrollment.paidAt ? formatDate(enrollment.paidAt) : <span className="text-faint">Not yet</span>}
                </td>
                <td className={tdCls}>
                  <Progress enrollment={enrollment} />
                </td>
                <td className={cn(tdCls, "max-md:hidden")}>
                  <RewardSummary enrollment={enrollment} />
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {!isError && !isPending && rows.length > 0 && data && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {data.total}{" "}
            {data.total === 1 ? "realtor" : "realtors"}
          </p>
          {data.pages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="size-4" aria-hidden /> Previous
              </Button>
              <span className="text-sm tabular-nums text-muted">
                Page {query.page} of {data.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={query.page >= data.pages}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}

      {open && <EnrollmentDetail enrollment={open} onClose={() => setOpened(null)} onChange={setOpened} />}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
  small,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium transition-colors",
        small ? "h-8 px-3.5 text-xs" : "h-9 px-4 text-sm",
        active ? "border-ink bg-ink text-bg" : "border-line text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("tabular-nums", active ? "text-bg/70" : "text-faint")}>{count}</span>
      )}
    </button>
  );
}

function ReferredBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[0.7rem] font-semibold text-brand-ink">
      <UserPlus className="size-3" aria-hidden />
      Referred
    </span>
  );
}

/** An admin's send from the Planbok balance that Planbok turned down: nothing left, press again. */
const unsentFromBalance = ({ incentive }: Enrollment) =>
  !!incentive?.fromBalance && incentive.status === "forwarding" && !incentive.forwarding?.reference;

/** A reward on its way, with no admin check pending: worth re-reading until it lands. */
const rewardMoving = (enrollment: Enrollment) =>
  !!enrollment.incentive &&
  !unsentFromBalance(enrollment) &&
  !enrollment.incentive.check &&
  ["funding", "forwarding", "purchasing"].includes(enrollment.incentive.status) &&
  enrollment.incentive.purchase?.status !== "RECONCILIATION_REQUIRED";

const PROVIDER_NAMES = { flutterwave: "Flutterwave", planbok: "Planbok" };

/** "RECONCILIATION_REQUIRED" -> "Reconciliation required". */
const purchaseStatus = (status: string) => {
  const words = status.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

type Tone = "muted" | "gold" | "verified";

const TONE_CLS: Record<Tone, string> = {
  muted: "text-muted",
  gold: "font-medium text-gold",
  verified: "font-semibold text-verified",
};

/**
 * The realtor's LBT reward in a line, plus the one detail that explains it. What is left of
 * the payment after INSPECTRA's share (30%, or 25% when referred) and Flutterwave's fees goes
 * into our Planbok account, on to LambaCard less Planbok's ₦15, and buys tokens into the
 * realtor's wallet. The table shows the title; the detail shows both.
 */
function rewardState(enrollment: Enrollment): { title: string; note?: string; tone: Tone } {
  const { incentive } = enrollment;

  if (!incentive)
    return { title: enrollment.status === "pending" ? "After payment" : "None for this course", tone: "muted" };

  const { status, purchase, check } = incentive;
  // Not known until the transfer to Planbok is first sent.
  const naira = incentive.amount ? formatNaira(incentive.amount) : "the reward";
  const tokens = purchase && `${formatTokenAmount(purchase.tokens)} LBT`;

  if (unsentFromBalance(enrollment))
    return {
      title: "Not sent yet",
      note: "Planbok turned the last attempt down, so nothing moved. Send it again from the Planbok balance.",
      tone: "gold",
    };

  if (check)
    return {
      title: `Check this transfer in ${PROVIDER_NAMES[check.provider]}`,
      note: `Sent, but nothing came back. Look up ${check.reference} there.`,
      tone: "gold",
    };

  if (status === "confirmed")
    return {
      title: `${tokens ?? "Tokens"} delivered`,
      note: purchase?.confirmedAt && `In the realtor's wallet since ${formatDate(purchase.confirmedAt)}.`,
      tone: "verified",
    };

  if (status === "rejected")
    return { title: "Rejected by LambaCard", note: "Settle it with LambaCard.", tone: "gold" };

  if (status === "sent")
    return {
      title: "Old payout, no tokens bought",
      note: `${naira} paid straight to LambaCard${incentive.sentAt ? ` on ${formatDate(incentive.sentAt)}` : ""}, before purchases began. Settle it with LambaCard, or once they return it, send the reward from the Planbok balance.`,
      tone: "gold",
    };

  if (status === "purchasing" && !purchase)
    return {
      title: "Waiting for the realtor's wallet",
      note: `${naira} is with LambaCard. The tokens are bought once the realtor has an active wallet.`,
      tone: "muted",
    };

  if (purchase?.status === "RECONCILIATION_REQUIRED")
    return { title: "LambaCard is reconciling", note: `${tokens} on hold until LambaCard settles it.`, tone: "gold" };

  if (purchase)
    return { title: `Buying ${tokens}`, note: `LambaCard: ${purchaseStatus(purchase.status)}.`, tone: "muted" };

  const titles: Partial<Record<typeof status, string>> = {
    due: `Waiting to send ${naira}`,
    funding: `Paying ${naira} into Planbok`,
    forwarding: `Forwarding ${naira} to LambaCard`,
  };

  return { title: titles[status] ?? "On its way", tone: "muted" };
}

function RewardSummary({ enrollment }: { enrollment: Enrollment }) {
  const { title, tone } = rewardState(enrollment);
  return <p className={cn("max-w-52 truncate text-sm", TONE_CLS[tone])} title={title}>{title}</p>;
}

/**
 * One enrollment in full, opened from its row. A Dialog, like a payment's, so the search,
 * filter and page survive a look at one realtor. Nothing here is edited.
 */
function EnrollmentDetail({
  enrollment,
  onClose,
  onChange,
}: {
  enrollment: Enrollment;
  onClose: () => void;
  onChange: (enrollment: Enrollment) => void;
}) {
  const { incentive } = enrollment;
  const reward = rewardState(enrollment);
  const purchase = incentive?.purchase;

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent closeLabel="Close enrollment" className="max-w-xl">
        <DialogTitle className="capitalize">{enrollment.fullname}</DialogTitle>
        <DialogDescription>
          {enrollment.email} · {formatPhone(enrollment.phone)}
        </DialogDescription>

        <div className="mt-5 rounded-xl bg-surface-2/60 p-4">
          <Progress enrollment={enrollment} />
        </div>

        <Section title="Course payment">
          <Row label="Reference" value={enrollment.reference} mono />
          <Row label="Amount" value={formatPriceFull(enrollment.amount)} />
          <Row label="Paid on" value={enrollment.paidAt ? formatDate(enrollment.paidAt) : "Not yet"} />
          <Row label="Started" value={formatDate(enrollment.createdAt)} />
        </Section>

        {incentive && <MoneySection enrollment={enrollment} />}

        {enrollment.referral && (
          <Section title="Referral">
            <Row label="Referred by" value={enrollment.referral.name ?? "Account no longer exists"} capitalize />
            {enrollment.referral.email && <Row label="Referrer email" value={enrollment.referral.email} />}
            <Row label="Code" value={enrollment.referral.code} mono />
            <Row label="Referrer wallet" value={enrollment.referral.walletAddress} mono />
            <Row
              label="Referrer tokens"
              value={purchase?.referralTokens ? `${formatTokenAmount(purchase.referralTokens)} LBT` : "With the purchase"}
            />
          </Section>
        )}

        <Section title="Token reward">
          <div className="rounded-xl border border-line p-4">
            <p className={cn("text-sm", TONE_CLS[reward.tone])}>{reward.title}</p>
            {reward.note && <p className="mt-1 text-sm text-muted">{reward.note}</p>}
          </div>
          <SendFromBalance enrollment={enrollment} onChange={onChange} />
        </Section>

        {incentive?.fromBalance && (
          <Section title="1. Funded from the Planbok balance">
            <Row label="Flutterwave" value="Skipped: paid before rewards existed" />
            {incentive.oldPayoutSentAt && (
              <Row label="Replaces" value={`The old payout of ${formatDate(incentive.oldPayoutSentAt)}, returned by LambaCard`} />
            )}
          </Section>
        )}

        {incentive?.funding?.reference && (
          <Section title="1. Flutterwave into Planbok">
            <Row label="Our reference" value={incentive.funding.reference} mono />
            {incentive.funding.transferId !== undefined && (
              <Row label="Flutterwave transfer id" value={String(incentive.funding.transferId)} mono />
            )}
            {incentive.funding.sentAt && <Row label="Landed" value={formatDate(incentive.funding.sentAt)} />}
          </Section>
        )}

        {incentive?.forwarding?.reference && (
          <Section title="2. Planbok to LambaCard">
            <Row label="Our key" value={incentive.forwarding.reference} mono />
            {incentive.forwarding.providerReference && (
              <Row label="Planbok reference" value={incentive.forwarding.providerReference} mono />
            )}
            {incentive.forwarding.sentAt && <Row label="Settled" value={formatDate(incentive.forwarding.sentAt)} />}
          </Section>
        )}

        {purchase && (
          <Section title="3. LambaCard purchase">
            <Row label="Purchase id" value={purchase.id} mono />
            <Row label="Status" value={purchaseStatus(purchase.status)} />
            <Row label="Realtor tokens" value={`${formatTokenAmount(purchase.tokens)} LBT`} />
            <Row label="Realtor wallet" value={purchase.walletAddress} mono />
            {purchase.referralTokens && (
              <Row label="Referrer tokens" value={`${formatTokenAmount(purchase.referralTokens)} LBT`} />
            )}
            {purchase.transactionHash && <Row label="Transaction" value={purchase.transactionHash} mono />}
            {purchase.confirmedAt && <Row label="Delivered" value={formatDate(purchase.confirmedAt)} />}
          </Section>
        )}

        {purchase?.explorerUrl && (
          <a
            href={purchase.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            View the transaction on BscScan <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Where the course payment went, to the kobo. Each line shows once it is known: the share
 * and the payment fee when the course is paid, the transfer fee and the amount when the
 * transfer to Planbok goes out, the forwarded amount when Planbok sends it on.
 */
function MoneySection({ enrollment }: { enrollment: Enrollment }) {
  const incentive = enrollment.incentive!;
  const forwarded = incentive.forwarding?.amount;
  const pending = "Not yet";

  if (incentive.fromBalance)
    return (
      <Section title="Money">
        <Row label="From the Planbok balance" value={incentive.amount ? formatNaira(incentive.amount) : pending} />
        <Row label="Planbok fee" value={formatNaira(PLANBOK_TRANSFER_FEE)} />
        <Row label="Reached LambaCard" value={forwarded ? formatNaira(forwarded) : pending} />
      </Section>
    );

  // Rows from before the shares existed carry only the flat amount.
  if (incentive.kept === undefined)
    return (
      <Section title="Money">
        <Row label="Course price" value={formatNaira(enrollment.amount)} />
        <Row
          // An old payout went straight to LambaCard, with no Planbok step.
          label={incentive.status === "sent" ? "Paid straight to LambaCard" : "Sent to Planbok"}
          value={incentive.amount ? formatNaira(incentive.amount) : pending}
        />
        {forwarded && <Row label="Reached LambaCard" value={formatNaira(forwarded)} />}
      </Section>
    );

  const share = enrollment.referral ? "25%" : "30%";

  return (
    <Section title="Money">
      <Row label="Course price" value={formatNaira(enrollment.amount)} />
      <Row label={`INSPECTRA keeps (${share})`} value={formatNaira(incentive.kept)} />
      <Row
        label="Flutterwave fee, payment"
        value={incentive.collectionFee !== undefined ? formatNaira(incentive.collectionFee) : "Not recorded"}
      />
      <Row
        label="Flutterwave fee, transfer"
        value={incentive.transferFee !== undefined ? formatNaira(incentive.transferFee) : pending}
      />
      <Row label="Sent to Planbok" value={incentive.amount ? formatNaira(incentive.amount) : pending} />
      <Row label="Planbok fee" value={formatNaira(PLANBOK_TRANSFER_FEE)} />
      <Row label="Reached LambaCard" value={forwarded ? formatNaira(forwarded) : pending} />
    </Section>
  );
}

/**
 * A course paid before rewards existed has no Flutterwave payout to start from, so an admin
 * starts it from money already in our Planbok account. The server checks everything again
 * and reads the balance live; this only decides whether to ask.
 */
function SendFromBalance({ enrollment, onChange }: { enrollment: Enrollment; onChange: (e: Enrollment) => void }) {
  const [confirming, setConfirming] = useState(false);
  const send = useSendEnrollmentReward();

  const eligible =
    enrollment.status !== "pending" &&
    enrollment.registered &&
    (!enrollment.incentive || ["due", "sent"].includes(enrollment.incentive.status) || unsentFromBalance(enrollment));

  const preview = useEnrollmentRewardPreview(enrollment.id, eligible);

  if (!eligible) return null;

  if (preview.isPending) return <div className="mt-3 h-10 animate-pulse rounded-xl bg-surface-2/60" />;

  if (preview.isError)
    return <p className="mt-3 text-sm text-muted">Cannot send a reward yet: {apiMessage(preview.error)}</p>;

  const { amount, forwarded, balance, accountName, walletAddress, oldPayoutSentAt } = preview.data;
  const short = balance < amount;
  const replacing = oldPayoutSentAt
    ? `The old ${formatPriceFull(amount)} payout of ${formatDate(oldPayoutSentAt)} went straight to LambaCard. Send only if LambaCard has returned it, or this pays twice.`
    : null;

  const confirm = async () => {
    try {
      const updated = await send.mutateAsync(enrollment.id);
      onChange(updated);
      toast.success("Reward started. The dialog shows each step as it lands.");
    } catch (err) {
      toast.error(apiMessage(err, "The reward could not be started."));
    }
  };

  return (
    <>
      {replacing && <p className="mt-3 rounded-xl bg-gold/10 p-3 text-sm text-gold">{replacing}</p>}
      <div className="mt-3 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
        <p className="text-sm text-muted">
          Planbok balance: <span className="font-medium tabular-nums text-ink">{formatPriceFull(balance)}</span>
          {short && <span className="text-gold">, short of {formatPriceFull(amount)}</span>}
        </p>
        <Button type="button" variant="brand" size="sm" disabled={short} onClick={() => setConfirming(true)}>
          Send reward from Planbok balance
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Send ${formatPriceFull(amount)} and buy this realtor's tokens?`}
        description={`This moves real money and cannot be undone. LambaCard buys LBT with it straight away.${replacing ? ` ${replacing}` : ""}`}
        confirmLabel={`Send ${formatPriceFull(amount)}`}
        pending={send.isPending}
        onConfirm={confirm}
      >
        <dl className="mt-4 space-y-2.5 rounded-xl bg-surface-2/60 p-4 text-sm">
          <Row label="From" value={`${accountName}'s Planbok account`} />
          <Row label="Balance" value={formatPriceFull(balance)} />
          <Row label="To LambaCard" value={formatPriceFull(forwarded)} />
          <Row label="Planbok fee" value={formatPriceFull(amount - forwarded)} />
          <Row label="Tokens to" value={walletAddress} mono />
        </dl>
      </ConfirmDialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">{title}</p>
      <dl className="mt-2 space-y-2.5 text-sm">{children}</dl>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line pb-2.5 last:border-0 last:pb-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-all text-right font-medium tabular-nums text-ink",
          mono && "text-xs tracking-wide",
          capitalize && "capitalize",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * The same two steps as the funnel on the course page, filled as far as this realtor got:
 * paid, then joined (paid with an account, which is what opens the dashboard). An account
 * alone is not joining: one opened at checkout exists before paying.
 */
function Progress({ enrollment }: { enrollment: Enrollment }) {
  const paid = enrollment.status !== "pending";
  const reached = [paid, paid && enrollment.registered];
  const step = reached.lastIndexOf(true);

  const label = step === -1 ? "Awaiting payment" : step === 0 ? "Paid, no account yet" : "Joined";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" aria-hidden>
        {reached.map((on, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-6 rounded-full",
              on ? (i === 1 ? "bg-verified" : "bg-brand") : "bg-surface-2 ring-1 ring-inset ring-line",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "whitespace-nowrap text-sm",
          step === 1 ? "font-semibold text-verified" : step === -1 ? "text-gold" : "text-ink",
        )}
      >
        {label}
      </span>
    </div>
  );
}
