import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  Receipt,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { CADENCE_ADVERB, TIERS } from "@/data/pricing";
import {
  PAID_QUERY,
  PENDING_QUERY,
  paymentMethod,
  useCancelPayment,
  useCancelSubscription,
  useCheckout,
  usePayments,
  useSubscription,
  type Cadence,
  type Payment,
  type PaymentFilter,
  type PaymentStatus,
  type Tier,
} from "@/lib/subscription";
import { apiMessage } from "@/lib/api";
import { formatDate, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAYMENT_META: Record<
  PaymentStatus,
  { Icon: typeof Check; ring: string; text: string; label: string }
> = {
  paid: { Icon: Check, ring: "bg-verified/12 text-verified", text: "text-verified", label: "Paid" },
  pending: { Icon: Clock, ring: "bg-gold/12 text-gold", text: "text-gold", label: "Awaiting payment" },
  failed: { Icon: TriangleAlert, ring: "bg-rose-500/12 text-rose-500", text: "text-rose-500", label: "Failed" },
};

const FILTERS: { id: PaymentFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Awaiting" },
  { id: "failed", label: "Failed" },
];

/** The marketing copy for a tier. The API prices a plan; it does not describe one. */
const copyFor = (tier: string) => TIERS.find((t) => t.id === tier);

export function RealtorSubscription() {
  const { data: state, isPending, isError, error } = useSubscription();

  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [page, setPage] = useState(1);

  const history = usePayments({ status: filter, page });
  // Each on its own query, so filtering the table below cannot hide an attempt still
  // open, nor blank the line saying how they last paid.
  const { data: awaiting } = usePayments(PENDING_QUERY);
  const { data: settled } = usePayments(PAID_QUERY);

  const checkout = useCheckout();
  const cancelPlan = useCancelSubscription();
  const dropAttempt = useCancelPayment();

  const [detail, setDetail] = useState<Payment | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [dropping, setDropping] = useState<string | null>(null);

  if (isError)
    return (
      <div className="space-y-8">
        <Reveal>
          <PageHeader title="Subscription" subtitle="Your plan and billing in one place." />
        </Reveal>
        <Reveal y={16}>
          <EmptyState
            icon={CreditCard}
            title="Could not load your subscription"
            message={apiMessage(error)}
          />
        </Reveal>
      </div>
    );

  if (isPending)
    return (
      <div className="space-y-8">
        <Reveal>
          <PageHeader title="Subscription" subtitle="Your plan and billing in one place." />
        </Reveal>
        <div className="h-44 animate-pulse rounded-2xl border border-line bg-surface-2/50" />
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-2/50" />
      </div>
    );

  const { subscription, plan, allowance } = state;
  const paid = plan.monthly > 0;
  const cancelled = subscription.status === "canceled";
  const usedPct = Math.min(100, Math.round((allowance.used / allowance.limit) * 100));

  const open = awaiting?.payments ?? [];
  const rows = history.data?.payments ?? [];
  const counts = history.data?.counts;
  const pages = history.data?.pages ?? 1;
  const lastPaid = settled?.payments[0];

  const resume = (tier: Tier, at: Cadence) => {
    if (checkout.isPending) return;

    checkout.mutate(
      { tier, cadence: at },
      { onError: (err) => toast.error(apiMessage(err, "We could not start that payment.")) },
    );
  };

  const drop = (reference: string) => {
    setDropping(reference);
    dropAttempt.mutate(reference, {
      onSuccess: (message) => toast.success(message ?? "Payment attempt dropped."),
      onError: (err) => toast.error(apiMessage(err, "We could not cancel that attempt.")),
      onSettled: () => setDropping(null),
    });
  };

  const choose = (next: PaymentFilter) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title="Subscription" subtitle="Your plan and billing in one place." />
      </Reveal>

      {/* current plan */}
      <Reveal y={16}>
        <Panel>
          <div className="flex items-start justify-between gap-6 max-sm:flex-col">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
                Current plan
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <h2 className="display text-3xl text-ink">{plan.name}</h2>
                <StatusPill status={subscription.status} />
              </div>
              <p className="mt-2 text-muted">
                {!paid ? (
                  "Free forever. Upgrade whenever you outgrow it."
                ) : subscription.currentPeriodEnd ? (
                  <>
                    Billed {CADENCE_ADVERB[subscription.cadence]} · runs until{" "}
                    <span className="font-semibold text-ink">
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </>
                ) : (
                  "Active."
                )}
              </p>
              {paid && subscription.currentPeriodEnd && (
                <p className="mt-1 text-sm text-faint">
                  {cancelled
                    ? "Cancelled. You keep everything until that date, then the account drops to Starter and any listings past the free three are hidden, never deleted."
                    : "Nothing renews automatically. When the period ends your account drops to Starter, and any listings past the free three are hidden, never deleted."}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2">
              {/* Plans are compared and bought on the pricing page. Repeating four cards
                  here only gave the console a second, smaller copy of that page to drift
                  from. */}
              <Link to="/pricing" className={buttonClasses("brand", "md")}>
                {paid ? "Change plan" : "See plans"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              {paid && !cancelled && (
                <Button
                  variant="outline"
                  className="text-rose-500 hover:bg-rose-500/10"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel plan
                </Button>
              )}
            </div>
          </div>

          {/* usage */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-ink">
                <Building2 className="size-4 text-brand-ink" aria-hidden />
                Active listings
              </span>
              <span className="tabular-nums text-muted">
                <span className="font-semibold text-ink">{allowance.used}</span> of{" "}
                {allowance.limit}
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand" style={{ width: `${usedPct}%` }} />
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* an attempt left hanging: finish it, or let it go */}
      {open.length > 0 && (
        <Reveal y={16}>
          <Panel title="Awaiting payment">
            <ul className="space-y-3">
              {open.map((attempt) => (
                <li
                  key={attempt.id}
                  className="flex items-center gap-4 rounded-xl border border-gold/30 bg-gold/5 p-4 max-sm:flex-col max-sm:items-stretch"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/12 text-gold max-sm:hidden">
                    <Clock className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {copyFor(attempt.tier ?? "")?.name ?? "Plan"} ·{" "}
                      {formatPriceFull(attempt.amount)}
                      {attempt.cadence && (
                        <span className="font-normal text-muted">
                          {" "}
                          billed {CADENCE_ADVERB[attempt.cadence]}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      Started {formatDate(attempt.createdAt)}. Nothing has been charged.
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 max-sm:flex-col">
                    <Button
                      variant="outline"
                      onClick={() => drop(attempt.reference)}
                      disabled={dropping === attempt.reference}
                    >
                      {dropping === attempt.reference ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                    <Button
                      variant="brand"
                      disabled={checkout.isPending || !attempt.tier || !attempt.cadence}
                      onClick={() =>
                        attempt.tier && attempt.cadence && resume(attempt.tier, attempt.cadence)
                      }
                    >
                      {checkout.isPending ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        "Continue payment"
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      )}

      {/* how they last paid */}
      {lastPaid && (
        <Reveal y={16}>
          <Panel title="Payment method">
            <div className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink">
                <CreditCard className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{paymentMethod(lastPaid)}</p>
                <p className="text-sm text-muted">
                  Last payment {lastPaid.paidAt ? formatDate(lastPaid.paidAt) : ""}. Nothing is
                  stored, and nothing is charged until you start a payment yourself.
                </p>
              </div>
            </div>
          </Panel>
        </Reveal>
      )}

      {/* billing history */}
      <Reveal y={16}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Billing history</h2>

            {/* Counts come off the unfiltered branch, so picking a segment with nothing
                in it still leaves every other segment reachable. */}
            <div className="inline-flex rounded-full border border-line bg-surface-2/60 p-1">
              {FILTERS.map((option) => {
                const active = filter === option.id;
                const count = counts?.[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors max-sm:px-2.5",
                      active
                        ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {option.label}
                    {count !== undefined && (
                      <span className="tabular-nums text-xs text-faint">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {history.isError ? (
            <EmptyState
              icon={Receipt}
              title="Could not load your payments"
              message={apiMessage(history.error)}
            />
          ) : history.isPending ? (
            <div className="h-48 animate-pulse rounded-2xl border border-line bg-surface-2/50" />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={filter === "all" ? "No payments yet" : "Nothing in this filter"}
              message={
                filter === "all"
                  ? "Once you pay for a plan, every receipt shows up here."
                  : "No payments have that status. Try another filter."
              }
            />
          ) : (
            <>
              <ul
                className={cn(
                  "divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface transition-opacity",
                  // keepPreviousData holds the old page while the next one loads, so it
                  // dims rather than collapsing the list to a spinner.
                  history.isPlaceholderData && "opacity-60",
                )}
              >
                {rows.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onOpen={() => setDetail(payment)}
                  />
                ))}
              </ul>

              {pages > 1 && (
                <Pager
                  page={page}
                  pages={pages}
                  busy={history.isPlaceholderData}
                  onPage={setPage}
                />
              )}
            </>
          )}
        </div>
      </Reveal>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel your plan?"
        description={
          subscription.currentPeriodEnd
            ? `You keep ${plan.name} until ${formatDate(subscription.currentPeriodEnd)}, because that period is already paid for. Nothing is refunded and no listing is deleted. After that date the account drops to Starter and listings past the free three are hidden until you pay again.`
            : "Your account will drop to Starter. Nothing is deleted."
        }
        confirmLabel="Cancel plan"
        cancelLabel="Keep it"
        destructive
        pending={cancelPlan.isPending}
        onConfirm={async () => {
          try {
            const res = await cancelPlan.mutateAsync();
            toast.success(res.message ?? "Your plan is cancelled.");
          } catch (err) {
            toast.error(apiMessage(err, "We could not cancel that plan."));
          }
        }}
      />

      <PaymentDetail payment={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Pager({
  page,
  pages,
  busy,
  onPage,
}: {
  page: number;
  pages: number;
  busy: boolean;
  onPage: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted">
        Page <span className="font-semibold text-ink">{page}</span> of {pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1 || busy}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages || busy}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "bg-verified/12 text-verified"
      : status === "past_due"
        ? "bg-gold/12 text-gold"
        : "bg-rose-500/12 text-rose-500";

  const label =
    status === "active" ? "Active" : status === "past_due" ? "Payment due" : "Cancelled";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

function PaymentRow({ payment, onOpen }: { payment: Payment; onOpen: () => void }) {
  const meta = PAYMENT_META[payment.status];
  const when = payment.paidAt ?? payment.createdAt;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-surface-2/40 max-sm:gap-3"
      >
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", meta.ring)}>
          <meta.Icon className="size-5" strokeWidth={2.4} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{formatDate(when)}</p>
          <p className="truncate text-xs text-muted">
            {copyFor(payment.tier ?? "")?.name ?? "Plan"}
            {payment.cadence && <> · {CADENCE_ADVERB[payment.cadence]}</>} ·{" "}
            <span className="uppercase tracking-wide">{payment.reference}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums text-ink">
            {formatPriceFull(payment.amount)}
          </p>
          <p className={cn("text-xs font-semibold", meta.text)}>{meta.label}</p>
        </div>
      </button>
    </li>
  );
}

/**
 * One receipt, opened from its row.
 *
 * A Dialog rather than ConfirmDialog: nothing here is being decided, so a stray click
 * that dismisses it costs nothing. It renders from the row that opened it, so it paints
 * with no spinner over data already on screen.
 */
function PaymentDetail({
  payment,
  onClose,
}: {
  payment: Payment | null;
  onClose: () => void;
}) {
  if (!payment) return null;

  const meta = PAYMENT_META[payment.status];
  const plan = copyFor(payment.tier ?? "")?.name ?? "Plan";

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent closeLabel="Close receipt">
        <DialogTitle>{plan} plan</DialogTitle>
        <DialogDescription>
          {payment.status === "paid"
            ? "Paid in full. This is what the charge covered."
            : "This payment was not completed, so nothing was charged."}
        </DialogDescription>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-2/60 p-4">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", meta.ring)}>
            <meta.Icon className="size-5" strokeWidth={2.4} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-semibold tabular-nums text-ink">
              {formatPriceFull(payment.amount)}
            </p>
            <p className={cn("text-xs font-semibold", meta.text)}>{meta.label}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Reference" value={payment.reference} mono />
          <Row
            label="Billing"
            value={payment.cadence ? CADENCE_ADVERB[payment.cadence] : "-"}
            capitalize
          />
          {payment.periodStart && payment.periodEnd && (
            <Row
              label="Covers"
              value={`${formatDate(payment.periodStart)} to ${formatDate(payment.periodEnd)}`}
            />
          )}
          {payment.paidAt && <Row label="Paid on" value={formatDate(payment.paidAt)} />}
          <Row label="Started" value={formatDate(payment.createdAt)} />
          {payment.status === "paid" && (
            <Row label="Method" value={paymentMethod(payment) || "-"} />
          )}
        </dl>

        {/* No download. There is no endpoint that renders a PDF, and a button that
            produced nothing would be worse than its absence. */}
      </DialogContent>
    </Dialog>
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
    <div className="flex items-baseline justify-between gap-6 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd
        className={cn(
          "min-w-0 text-right font-medium text-ink",
          mono && "uppercase tracking-wide",
          capitalize && "capitalize",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
