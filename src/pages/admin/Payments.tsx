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
import { DataTable, thCls, tdCls } from "@/components/dashboard/DataTable";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Reveal } from "@/components/ui/Reveal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  ledgerMethod,
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
                <tr key={payment.id} className="transition-colors hover:bg-surface-2/40">
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
    </div>
  );
}
