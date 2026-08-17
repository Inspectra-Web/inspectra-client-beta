import { useState } from "react";
import { toast } from "react-toastify";
import {
  Check,
  Clock,
  CreditCard,
  Building2,
  CircleCheck,
  Download,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { TIERS, type Tier, type BillingCadence } from "@/data/pricing";
import { subscription, TIER_LISTING_LIMIT, type InvoiceStatus } from "@/data/realtor";
import { formatPrice, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

const INVOICE_META: Record<
  InvoiceStatus,
  { Icon: typeof Check; ring: string; text: string; label: string }
> = {
  paid: { Icon: Check, ring: "bg-verified/12 text-verified", text: "text-verified", label: "Paid" },
  pending: { Icon: Clock, ring: "bg-gold/12 text-gold", text: "text-gold", label: "Pending" },
  failed: { Icon: TriangleAlert, ring: "bg-rose-500/12 text-rose-500", text: "text-rose-500", label: "Failed" },
};

export function RealtorSubscription() {
  const [cadence, setCadence] = useState<BillingCadence>(subscription.cadence);

  const current = TIERS.find((t) => t.id === subscription.tierId)!;
  const limit = TIER_LISTING_LIMIT[subscription.tierId];
  const unlimited = limit === Infinity;
  const usedPct = unlimited ? 30 : Math.min(100, Math.round((subscription.listingsUsed / limit) * 100));
  const currentPrice =
    subscription.cadence === "annual" ? current.annual : current.monthly;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Subscription"
          subtitle="Your plan, billing and payment history in one place."
        />
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
                <h2 className="display text-3xl text-ink">{current.name}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-verified/12 px-2.5 py-1 text-xs font-semibold text-verified">
                  <span className="size-1.5 rounded-full bg-current" aria-hidden />
                  {subscription.status === "active" ? "Active" : subscription.status}
                </span>
              </div>
              <p className="mt-2 text-muted">
                {currentPrice === 0 ? (
                  "Free forever"
                ) : (
                  <>
                    <span className="font-semibold text-ink">{formatPriceFull(currentPrice)}</span>{" "}
                    billed {subscription.cadence === "annual" ? "annually" : "monthly"} · renews{" "}
                    {subscription.renewsOn}
                  </>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 text-rose-500 hover:bg-rose-500/10 max-sm:w-full"
              onClick={() => toast.info("Cancellation flow is coming soon.")}
            >
              Cancel plan
            </Button>
          </div>

          {/* usage */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-ink">
                <Building2 className="size-4 text-brand-ink" aria-hidden />
                Active listings
              </span>
              <span className="tabular-nums text-muted">
                <span className="font-semibold text-ink">{subscription.listingsUsed}</span> of{" "}
                {unlimited ? "Unlimited" : limit}
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn("h-full rounded-full", unlimited ? "bg-brand/50" : "bg-brand")}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* payment method */}
      <Reveal y={16}>
        <Panel title="Payment method">
          <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-stretch">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink">
              <CreditCard className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">
                {subscription.paymentBrand} ending {subscription.paymentLast4}
              </p>
              <p className="text-sm text-muted">Next charge on {subscription.renewsOn}</p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 max-sm:w-full"
              onClick={() => toast.info("Update card flow is coming soon.")}
            >
              Update
            </Button>
          </div>
        </Panel>
      </Reveal>

      {/* plan options */}
      <Reveal y={16}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Change plan</h2>
            {/* cadence toggle */}
            <div className="inline-flex rounded-full border border-line bg-surface-2/60 p-1">
              {(["monthly", "annual"] as BillingCadence[]).map((c) => {
                const active = cadence === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCadence(c)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                      active ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
                    )}
                  >
                    {c}
                    {c === "annual" && (
                      <span className="rounded-full bg-verified/12 px-1.5 text-xs font-semibold text-verified">
                        2 months free
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
            {TIERS.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                cadence={cadence}
                current={tier.id === subscription.tierId}
                onSwitch={() => toast.success(`Switching to ${tier.name}. Payments are coming soon.`)}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* billing history */}
      <Reveal y={16}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Billing history</h2>
              <p className="text-sm text-muted">
                {subscription.invoices.length} receipts · all on {subscription.paymentBrand} ····{" "}
                {subscription.paymentLast4}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Export is coming soon.")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:underline max-sm:hidden"
            >
              <Download className="size-4" aria-hidden />
              Export all
            </button>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {subscription.invoices.map((inv) => {
              const m = INVOICE_META[inv.status];
              return (
                <li
                  key={inv.id}
                  className="group flex items-center gap-4 p-4 transition-colors hover:bg-surface-2/40 max-sm:gap-3"
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", m.ring)}>
                    <m.Icon className="size-5" strokeWidth={2.4} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{inv.date}</p>
                    <p className="truncate text-xs text-muted">
                      {inv.plan} · {inv.cadence === "annual" ? "Annual" : "Monthly"} ·{" "}
                      <span className="uppercase tracking-wide">{inv.id}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums text-ink">{formatPriceFull(inv.amount)}</p>
                    <p className={cn("text-xs font-semibold", m.text)}>{m.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Invoice download is coming soon.")}
                    aria-label={`Download invoice ${inv.id.toUpperCase()}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand-ink max-sm:hidden"
                  >
                    <Download className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TierCard({
  tier,
  cadence,
  current,
  onSwitch,
}: {
  tier: Tier;
  cadence: BillingCadence;
  current: boolean;
  onSwitch: () => void;
}) {
  const free = tier.monthly === 0;
  const price = free ? "Free" : formatPrice(cadence === "annual" ? tier.annual : tier.monthly);
  const suffix = free ? "" : cadence === "annual" ? "/yr" : "/mo";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-5",
        current ? "border-brand bg-brand/5 ring-1 ring-brand/40" : "border-line bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{tier.name}</h3>
        {current ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand-ink">
            <CircleCheck className="size-3.5" aria-hidden /> Current
          </span>
        ) : (
          tier.highlighted && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
              Popular
            </span>
          )
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold text-ink">
        {price}
        {suffix && <span className="text-base font-normal text-muted"> {suffix}</span>}
      </p>
      <p className="mt-1.5 text-sm text-muted">{tier.tagline}</p>

      <ul className="mt-4 space-y-2">
        {tier.features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-1">
        {current ? (
          <span className={cn(buttonClasses("outline", "md", "w-full"), "pointer-events-none opacity-60")}>
            Current plan
          </span>
        ) : (
          <Button variant={tier.highlighted ? "brand" : "outline"} className="w-full" onClick={onSwitch}>
            Switch to {tier.name}
          </Button>
        )}
      </div>
    </div>
  );
}
