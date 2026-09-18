import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Reveal } from "@/components/ui/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  ledgerMethod,
  useAdminPayment,
  useAdminPayments,
  type LedgerQuery,
} from "@/lib/adminPayments";
import { TIERS } from "@/data/pricing";
import { apiMessage } from "@/lib/api";
import { formatDate, formatPrice, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

const STATUS_TONE: Record<string, string> = {
  paid: "text-verified",
  pending: "text-gold",
  failed: "text-rose-500",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Awaiting",
  failed: "Failed",
};

const planName = (tier?: string) =>
  TIERS.find((t) => t.id === tier)?.name ?? "-";

export function AdminPayments() {
  const [query, setQuery] = useState<LedgerQuery>({ q: "", status: "all", page: 1 });
  const [typed, setTyped] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setQuery((prev) =>
          prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 },
        ),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminPayments(query);

  const rows = data?.payments ?? [];
  const revenue = data?.revenue;
  const counts = data?.counts;
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const filtered = query.q !== "" || query.status !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Payments"
          subtitle="Every subscription payment on the platform, and what they add up to."
        />
      </Reveal>

      {/* Money that actually arrived, and what is currently held. No MRR: nothing
          auto-renews, so a recurring figure would be a projection, not a measurement. */}
      <Reveal y={16}>
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <StatCard
            icon={Wallet}
            label="Collected"
            value={formatPrice(revenue?.collected ?? 0)}
            hint="All settled payments"
          />
          <StatCard
            icon={TrendingUp}
            label="This month"
            value={formatPrice(revenue?.thisMonth ?? 0)}
            hint="Settled since the 1st"
          />
          <StatCard
            icon={Users}
            label="Plans held"
            value={String(revenue?.activePlans ?? 0)}
            hint={
              revenue?.endingPlans
                ? `${revenue.endingPlans} cancelled, ending at period end`
                : `Worth ${formatPrice(revenue?.monthlyValue ?? 0)} a month`
            }
          />
        </div>
      </Reveal>

      {/* Per-tier breakdown, only once there is something to break down. */}
      {revenue && revenue.plans.length > 0 && (
        <Reveal y={16}>
          <div className="flex flex-wrap gap-2.5">
            {revenue.plans.map((plan) => (
              <span
                key={plan.tier}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm"
              >
                <span className="font-semibold text-ink">{plan.name}</span>
                <span className="tabular-nums text-muted">{plan.count}</span>
                {plan.ending > 0 && (
                  <span className="rounded-full bg-gold/12 px-1.5 text-xs font-semibold tabular-nums text-gold">
                    {plan.ending} ending
                  </span>
                )}
              </span>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-64 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
              aria-hidden
            />
            <Input
              type="search"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search by realtor, email or reference…"
              aria-label="Search payments"
              className="h-10 pl-11"
            />
          </div>
          {/* Counts come off the unfiltered branch, so picking a status with nothing in
              it still leaves every other status reachable. */}
          <AdminSelect
            label="Status"
            value={query.status}
            onChange={(status) =>
              setQuery((prev) => ({
                ...prev,
                status: status as LedgerQuery["status"],
                page: 1,
              }))
            }
            options={[
              { value: "all", label: `All${counts ? ` (${counts.all})` : ""}` },
              { value: "paid", label: `Paid${counts ? ` (${counts.paid})` : ""}` },
              { value: "pending", label: `Awaiting${counts ? ` (${counts.pending})` : ""}` },
              { value: "failed", label: `Failed${counts ? ` (${counts.failed})` : ""}` },
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={Wallet}
            title="Could not load payments"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-2/50" />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={Wallet}
            title={filtered ? "Nothing in this filter" : "No payments yet"}
            message={
              filtered
                ? "No payment matches that search or status. Try another."
                : "When a realtor pays for a plan, the payment shows up here."
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
            <DataTable
              minWidthClass="sm:min-w-[860px]"
              head={
                <tr>
                  <th className={thCls}>S/N</th>
                  <th className={thCls}>Realtor</th>
                  <th className={thCls}>Plan</th>
                  <th className={thCls}>Amount</th>
                  <th className={cn(thCls, "max-md:hidden")}>Method</th>
                  <th className={cn(thCls, "max-md:hidden")}>Date</th>
                  <th className={thCls}>Status</th>
                </tr>
              }
            >
              {rows.map((payment, i) => (
                <tr
                  key={payment.id}
                  className={rowCls}
                  onClick={() => setOpen(payment.reference)}
                >
                  <td className={cn(tdCls, "tabular-nums text-faint")}>
                    {(query.page - 1) * (data?.limit ?? 12) + i + 1}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatar={payment.realtor.avatar}
                        name={payment.realtor.fullname}
                        className="size-8"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium capitalize text-ink">
                          {payment.realtor.fullname}
                        </p>
                        <p className="truncate text-xs uppercase tracking-wide text-faint">
                          {payment.reference}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <span className="text-ink">{planName(payment.tier)}</span>
                    {payment.cadence && (
                      <span className="ml-1.5 text-xs capitalize text-faint">
                        {payment.cadence}
                      </span>
                    )}
                  </td>
                  <td className={cn(tdCls, "font-semibold tabular-nums text-ink")}>
                    {formatPriceFull(payment.amount)}
                  </td>
                  <td className={cn(tdCls, "capitalize text-muted max-md:hidden")}>
                    {ledgerMethod(payment)}
                  </td>
                  <td className={cn(tdCls, "text-muted max-md:hidden")}>
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </td>
                  <td className={cn(tdCls, "font-semibold", STATUS_TONE[payment.status])}>
                    {STATUS_LABEL[payment.status]}
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </Reveal>
      )}

      {!isError && !isPending && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of{" "}
            {total} {total === 1 ? "payment" : "payments"}
          </p>

          {pages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-muted">
                Page {query.page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={query.page >= pages}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}

      <PaymentDetail reference={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * One payment in full, opened from its row.
 *
 * A Dialog rather than a detail page, unlike the rest of the admin console. The ledger
 * carries a search, a filter and a page number, and a navigation away would throw all
 * three away for a look at one row. Nothing here is edited, so dismissing it costs
 * nothing either.
 */
function PaymentDetail({
  reference,
  onClose,
}: {
  reference: string | null;
  onClose: () => void;
}) {
  const { data, isPending, isError, error } = useAdminPayment(reference ?? "");

  if (!reference) return null;

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent closeLabel="Close payment" className="max-w-xl">
        {isError ? (
          <>
            <DialogTitle>Could not load that payment</DialogTitle>
            <DialogDescription>{apiMessage(error)}</DialogDescription>
          </>
        ) : isPending || !data ? (
          <>
            <DialogTitle>Loading payment</DialogTitle>
            <DialogDescription>Fetching {reference}.</DialogDescription>
            <div className="mt-5 h-48 animate-pulse rounded-xl bg-surface-2/60" />
          </>
        ) : (
          <Detail data={data} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ data }: { data: NonNullable<ReturnType<typeof useAdminPayment>["data"]> }) {
  const { payment, realtor, subscription, plan, allowance, history } = data;

  return (
    <>
      <DialogTitle>
        {planName(payment.tier)} plan · {formatPriceFull(payment.amount)}
      </DialogTitle>
      <DialogDescription>
        <span className={cn("font-semibold", STATUS_TONE[payment.status])}>
          {STATUS_LABEL[payment.status]}
        </span>
        {payment.paidAt ? ` on ${formatDate(payment.paidAt)}` : ""}
        {payment.failureReason ? ` · ${payment.failureReason}` : ""}
      </DialogDescription>

      {/* who paid */}
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-2/60 p-4">
        <UserAvatar
          avatar={realtor.avatar}
          name={realtor.fullname}
          className="size-10 shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold capitalize text-ink">{realtor.fullname}</p>
          <p className="truncate text-sm text-muted">{realtor.email}</p>
        </div>
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
            realtor.status === "active"
              ? "bg-verified/12 text-verified"
              : "bg-rose-500/12 text-rose-500",
          )}
        >
          {realtor.status}
        </span>
      </div>

      <Section title="This payment">
        <Row label="Reference" value={payment.reference} mono />
        <Row label="Amount" value={`${formatPriceFull(payment.amount)} ${payment.currency}`} />
        <Row label="Billing" value={payment.cadence ?? "-"} capitalize />
        <Row label="Method" value={ledgerMethod(payment)} />
        {payment.periodStart && payment.periodEnd && (
          <Row
            label="Covers"
            value={`${formatDate(payment.periodStart)} to ${formatDate(payment.periodEnd)}`}
          />
        )}
        <Row label="Started" value={formatDate(payment.createdAt)} />
      </Section>

      {/* The two strings that find this charge in Flutterwave. */}
      {(payment.flwId || payment.flwRef) && (
        <Section title="Gateway">
          {payment.flwId !== undefined && (
            <Row label="Transaction id" value={String(payment.flwId)} mono />
          )}
          {payment.flwRef && <Row label="Flutterwave ref" value={payment.flwRef} mono />}
        </Section>
      )}

      <Section title="Plan today">
        <Row label="Tier" value={plan.name} />
        <Row
          label="State"
          value={
            subscription.status === "canceled"
              ? "Cancelled, runs to period end"
              : subscription.status === "past_due"
                ? "Payment due"
                : "Active"
          }
        />
        {subscription.currentPeriodEnd && (
          <Row label="Runs until" value={formatDate(subscription.currentPeriodEnd)} />
        )}
        <Row label="Listings" value={`${allowance.used} of ${allowance.limit}`} />
      </Section>

      {history.length > 1 && (
        <Section title={`Their last ${history.length} payments`}>
          {history.map((row) => (
            <Row
              key={row.id}
              label={formatDate(row.paidAt ?? row.createdAt)}
              value={`${formatPriceFull(row.amount)} · ${STATUS_LABEL[row.status] ?? row.status}`}
            />
          ))}
        </Section>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
        {title}
      </p>
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
          "min-w-0 break-all text-right font-medium text-ink",
          mono && "text-xs uppercase tracking-wide",
          capitalize && "capitalize",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
