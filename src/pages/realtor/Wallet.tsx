import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Check, CircleAlert, Copy, WalletMinimal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { apiMessage } from "@/lib/api";
import { useIdentity } from "@/lib/identity";
import { formatDate } from "@/lib/format";
import { CHAIN_NAMES, useOpenWallet, useWallet, type Wallet } from "@/lib/wallet";
import { cn } from "@/lib/cn";

export function RealtorWallet() {
  const { data: wallet, isPending, isError, error } = useWallet();

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title="Wallet" subtitle="Your own wallet address on BNB Smart Chain." />
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState icon={WalletMinimal} title="Could not load your wallet" message={apiMessage(error)} />
        </Reveal>
      ) : isPending ? (
        <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
      ) : wallet?.status === "active" ? (
        <WalletDetails wallet={wallet} />
      ) : (
        <CreateWallet />
      )}
    </div>
  );
}

function WalletDetails({ wallet }: { wallet: Wallet }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the address instead.");
    }
  };

  return (
    <Reveal y={16}>
      <Panel title="Wallet details" className="max-w-3xl">
        <div className="min-w-0">
          <p className="text-sm text-muted">Address</p>
          <div className="mt-1 flex items-center gap-3">
            <p className="min-w-0 break-all text-xl font-medium text-ink tabular-nums max-sm:text-base">
              {wallet.address}
            </p>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy wallet address"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-ink"
            >
              {copied ? <Check className="size-4 text-verified" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 max-sm:grid-cols-1">
          <Detail label="Network" value={CHAIN_NAMES[wallet.blockchain] ?? wallet.blockchain} />
          {wallet.activatedAt && <Detail label="Created" value={formatDate(wallet.activatedAt)} />}
        </dl>
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

function CreateWallet() {
  const identity = useIdentity();
  const open = useOpenWallet();

  const verified = identity.data?.verified ?? false;

  const submit = () =>
    open.mutate(undefined, {
      onSuccess: () => toast.success("Your wallet is ready."),
      onError: (err) => toast.error(apiMessage(err, "We could not create your wallet.")),
    });

  return (
    <Reveal y={16}>
      <Panel className="max-w-2xl">
        <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
          <WalletMinimal className="size-6" />
        </span>
        <h2 className="display mt-5 text-2xl text-ink">Create your wallet</h2>
        <p className="mt-2 text-muted">
          A wallet address in your name on BNB Smart Chain, held for you by INSPECTRA.
        </p>

        <div className="mt-6 flex items-center gap-3 text-sm">
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full",
              verified ? "bg-verified/15 text-verified" : "bg-surface-2 text-faint",
            )}
          >
            {verified ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}
          </span>
          <span className={verified ? "text-ink" : "text-muted"}>Verify your identity</span>
          {!identity.isPending && !verified && (
            <Link to="/realtor/account?tab=identity" className="ml-auto font-medium text-brand hover:underline">
              Fix this
            </Link>
          )}
        </div>

        <Button
          type="button"
          variant="brand"
          className="mt-6"
          onClick={submit}
          disabled={!verified || open.isPending}
        >
          {open.isPending ? "Creating your wallet..." : "Create wallet"}
        </Button>

        {!identity.isPending && !verified && (
          <p className="mt-3 text-sm text-faint">Verify your identity to create your wallet.</p>
        )}
      </Panel>
    </Reveal>
  );
}
