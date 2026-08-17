import { useMemo, useState } from "react";
import { Award, Repeat, Wallet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, thCls, tdCls } from "@/components/dashboard/DataTable";
import { Reveal } from "@/components/ui/Reveal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { transactions, revenue, realtorById, type TxnKind, type TxnStatus } from "@/data/admin";
import { formatPrice, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

const KIND_LABEL: Record<TxnKind, string> = {
  subscription: "Subscription",
  certification: "Certification",
};
const KIND_ICON: Record<TxnKind, typeof Repeat> = {
  subscription: Repeat,
  certification: Award,
};
const STATUS_TONE: Record<TxnStatus, string> = {
  paid: "text-verified",
  pending: "text-gold",
  failed: "text-rose-500",
};

export function AdminPayments() {
  const [kind, setKind] = useState("all");

  const rows = useMemo(
    () => (kind === "all" ? transactions : transactions.filter((t) => t.kind === kind)),
    [kind],
  );

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Payments"
          subtitle="Revenue from the realtor layers: recurring subscriptions and one-time certification."
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Reveal y={16}>
          <StatCard icon={Wallet} label="Monthly recurring" value={formatPrice(revenue.mrr)} hint="Active subscriptions" />
        </Reveal>
        <Reveal y={16} delay={0.05}>
          <StatCard icon={Award} label="Certification (recent)" value={formatPrice(revenue.certification)} hint="One-time enablement fees" />
        </Reveal>
      </div>

      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-2.5">
          <AdminSelect
            label="Transaction type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All transactions" },
              { value: "subscription", label: "Subscriptions" },
              { value: "certification", label: "Certification" },
            ]}
          />
        </div>
      </Reveal>

      <Reveal y={16}>
        <DataTable
          minWidthClass="sm:min-w-[720px]"
          head={
            <tr>
              <th className={cn(thCls, "w-12")}>S/N</th>
              <th className={thCls}>Type</th>
              <th className={thCls}>Realtor</th>
              <th className={cn(thCls, "max-md:hidden")}>Plan</th>
              <th className={thCls}>Amount</th>
              <th className={cn(thCls, "max-md:hidden")}>Date</th>
              <th className={thCls}>Status</th>
            </tr>
          }
        >
          {rows.map((t, i) => {
            const Icon = KIND_ICON[t.kind];
            const realtor = realtorById(t.realtorId);
            return (
              <tr key={t.id} className="transition-colors hover:bg-surface-2/40">
                <td className={cn(tdCls, "tabular-nums text-muted")}>{i + 1}</td>
                <td className={tdCls}>
                  <span className="inline-flex items-center gap-2 font-medium text-ink">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {KIND_LABEL[t.kind]}
                  </span>
                </td>
                <td className={cn(tdCls, "text-sm text-muted")}>{realtor?.name ?? "-"}</td>
                <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{t.tier ?? "-"}</td>
                <td className={cn(tdCls, "font-medium tabular-nums text-ink")}>{formatPriceFull(t.amount)}</td>
                <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{t.at}</td>
                <td className={cn(tdCls, "text-sm font-medium capitalize", STATUS_TONE[t.status])}>{t.status}</td>
              </tr>
            );
          })}
        </DataTable>
      </Reveal>
    </div>
  );
}
