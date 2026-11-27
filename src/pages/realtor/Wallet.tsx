import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Check, CircleAlert, Coins, Copy, ExternalLink, Fuel, Gift, UserPlus, WalletMinimal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { apiMessage } from "@/lib/api";
import { useIdentity } from "@/lib/identity";
import { formatDate } from "@/lib/format";
import {
  formatTokenAmount,
  useMyReferral,
  useOpenWallet,
  useWallet,
  useWalletBalances,
  useWalletRewards,
  type Reward,
  type Referral,
  type TokenBalance,
  type Wallet,
} from "@/lib/wallet";
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
        <>
          <CourseRewards />
          <WalletBalances />
          <ReferRealtor />
          <WalletAddress wallet={wallet} />
        </>
      ) : (
        <CreateWallet />
      )}
    </div>
  );
}

// The native coin pays the network fee, so it reads as gas and sits after the tokens.
const isGas = (balance: TokenBalance) => balance.standard === "native";

const CARD_TINTS = [
  "border-brand/25 from-brand/15 via-brand/5",
  "border-brand-ink/25 from-brand-ink/15 via-brand-ink/5",
];

function WalletBalances() {
  const { data: balances, isPending, isError } = useWalletBalances();

  if (isPending)
    return (
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    );

  if (isError || !balances || balances.length === 0)
    return (
      <Reveal y={16}>
        <Panel>
          <p className="text-sm text-muted">
            {isError || !balances
              ? "Your balance is not available right now."
              : "No tokens in this wallet yet."}
          </p>
        </Panel>
      </Reveal>
    );

  const ordered = [...balances].sort((a, b) => Number(isGas(a)) - Number(isGas(b)));

  return (
    <Reveal y={16}>
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        {ordered.map((balance, index) => (
          <BalanceCard key={balance.symbol} balance={balance} tint={CARD_TINTS[index % CARD_TINTS.length]} />
        ))}
      </div>
    </Reveal>
  );
}

function BalanceCard({ balance, tint }: { balance: TokenBalance; tint?: string }) {
  const gas = isGas(balance);
  const Icon = gas ? Fuel : Coins;

  return (
    <section className={cn("rounded-2xl border bg-surface bg-linear-to-br to-transparent p-7 max-sm:p-5", tint)}>
      <p className="flex items-center gap-2 text-sm text-muted">
        <Icon className="size-4 shrink-0" aria-hidden />
        {gas ? `Gas balance (${balance.symbol})` : `${balance.name} balance`}
      </p>
      <p className="mt-4 flex min-w-0 items-baseline gap-2.5" title={`${balance.amount} ${balance.symbol}`}>
        <span className="display truncate text-5xl tabular-nums text-ink max-sm:text-4xl">
          {formatTokenAmount(balance.amount)}
        </span>
        <span className={cn("shrink-0 text-xl font-semibold", gas ? "text-brand-ink" : "text-ink")}>
          {balance.symbol}
        </span>
      </p>
    </section>
  );
}

/** The LBT bought with part of the course payment, shown until and after it lands. */
function CourseRewards() {
  const { data } = useWalletRewards();
  const rewards = data?.filter((reward) => reward.source === "course");

  if (!rewards?.length) return null;

  return (
    <Reveal y={16}>
      <div className="space-y-4">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>
    </Reveal>
  );
}

function RewardCard({ reward }: { reward: Reward }) {
  const amount = reward.tokens && `${formatTokenAmount(reward.tokens)} ${reward.symbol}`;
  const delivered = reward.status === "delivered";

  return (
    <section
      className={cn(
        "flex items-start gap-5 rounded-2xl border bg-surface p-7 max-sm:gap-3 max-sm:p-5",
        delivered ? "border-verified/30" : "border-line",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl max-sm:hidden",
          delivered ? "bg-verified/10 text-verified" : "bg-brand/10 text-brand",
        )}
      >
        <Gift className="size-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">Course reward</p>

        {delivered ? (
          <>
            <p className="display mt-1 text-3xl tabular-nums text-ink">{amount}</p>
            <p className="mt-2 text-sm text-muted">
              Added to your wallet{reward.deliveredAt && ` on ${formatDate(reward.deliveredAt)}`}.
            </p>
            {reward.explorerUrl && (
              <a
                href={reward.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                View the transaction <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </>
        ) : reward.status === "delayed" ? (
          <>
            <p className="mt-1 font-medium text-ink">Your reward is delayed</p>
            <p className="mt-1 text-sm text-muted">We are sorting it out and will update this page.</p>
          </>
        ) : (
          <>
            <p className="mt-1 font-medium text-ink">
              {amount ? `${amount} is on its way to your wallet` : "Your LBT tokens are on their way to your wallet"}
            </p>
            <p className="mt-1 text-sm text-muted">It shows here as soon as it arrives.</p>
          </>
        )}
      </div>
    </section>
  );
}

/** Copies text and shows a tick for two seconds; `what` names it in the fallback message. */
function useCopy(what: string) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Could not copy. Select the ${what} instead.`);
    }
  };

  return { copied, copy };
}

/** The realtor's referral link, what it has earned, and each referral's reward. */
function ReferRealtor() {
  const { data: referral, isPending, isError, error } = useMyReferral(true);
  const { data: rewards } = useWalletRewards();
  const referrals = rewards?.filter((reward) => reward.source === "referral") ?? [];

  if (isPending) return <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />;

  return (
    <Reveal y={16}>
      <Panel>
        <div className="flex items-start gap-5 max-sm:gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand max-sm:hidden">
            <UserPlus className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="display text-2xl text-ink">Refer a realtor</h2>
            <p className="mt-1 text-sm text-muted">
              Share your link or code. Every realtor who joins with it and pays for the course earns you LBT,
              sent to this wallet.
            </p>

            {isError ? (
              <p className="mt-5 text-sm text-muted">
                {apiMessage(error, "Your referral link is not available right now.")}
              </p>
            ) : (
              <ReferralShare referral={referral} />
            )}
          </div>
        </div>

        {referrals.length > 0 && (
          <ul className="mt-7 divide-y divide-line border-t border-line">
            {referrals.map((reward) => (
              <ReferralRewardRow key={reward.id} reward={reward} />
            ))}
          </ul>
        )}
      </Panel>
    </Reveal>
  );
}

function ReferralShare({ referral }: { referral: Referral }) {
  const link = useCopy("link");
  const code = useCopy("code");

  const stats = [
    ["Realtors referred", String(referral.referred)],
    ["Rewards received", String(referral.delivered)],
    ["Earned", `${formatTokenAmount(referral.tokens)} ${referral.symbol}`],
  ];

  return (
    <>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-sm:grid-cols-1">
        <CopyField label="Your link" value={referral.link} copied={link.copied} onCopy={() => link.copy(referral.link)} />
        <CopyField
          label="Code"
          value={referral.code}
          copied={code.copied}
          onCopy={() => code.copy(referral.code)}
          className="tracking-[0.12em]"
        />
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4 max-sm:grid-cols-2 max-sm:gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-surface-2/60 px-4 py-3 last:max-sm:col-span-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function CopyField({
  label,
  value,
  copied,
  onCopy,
  className,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  className?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{label}</p>
        <p className={cn("truncate font-medium text-ink", className)}>{value}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-ink"
      >
        {copied ? <Check className="size-4 text-verified" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

function ReferralRewardRow({ reward }: { reward: Reward }) {
  const amount = reward.tokens && `${formatTokenAmount(reward.tokens)} ${reward.symbol}`;
  const delivered = reward.status === "delivered";

  return (
    <li className="flex items-center gap-4 py-4 max-sm:flex-wrap max-sm:gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">
          From <span className="capitalize">{reward.referredName}</span>'s course
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {delivered
            ? `Added to your wallet${reward.deliveredAt ? ` on ${formatDate(reward.deliveredAt)}` : ""}`
            : reward.status === "delayed"
              ? "Delayed. We are sorting it out."
              : "On its way to your wallet"}
        </p>
      </div>
      {amount && <p className="shrink-0 font-semibold tabular-nums text-ink">{amount}</p>}
      {delivered && reward.explorerUrl && (
        <a
          href={reward.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View the transaction"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-brand hover:bg-brand/10"
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
      )}
    </li>
  );
}

function WalletAddress({ wallet }: { wallet: Wallet }) {
  const { copied, copy: copyText } = useCopy("address");
  const copy = () => copyText(wallet.address);

  return (
    <Reveal y={16}>
      <Panel>
        <div className="flex items-center gap-5 max-sm:gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand max-sm:hidden">
            <WalletMinimal className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">
              {wallet.blockchain} address
              {wallet.activatedAt && <span className="text-faint"> · Created {formatDate(wallet.activatedAt)}</span>}
            </p>
            <p className="mt-1 break-all font-medium text-ink tabular-nums">{wallet.address}</p>
          </div>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy wallet address"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:text-ink"
          >
            {copied ? <Check className="size-4 text-verified" /> : <Copy className="size-4" />}
          </button>
        </div>
      </Panel>
    </Reveal>
  );
}

function CreateWallet() {
  const identity = useIdentity();
  const open = useOpenWallet();
  const { data: rewards } = useWalletRewards();

  const verified = identity.data?.verified ?? false;
  const waiting =
    rewards?.some((reward) => reward.source === "course" && reward.status !== "delivered") ?? false;

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

        {waiting && (
          <p className="mt-5 flex items-start gap-3 rounded-xl bg-brand/10 p-4 text-sm text-ink">
            <Gift className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            Your course reward is waiting. Create your wallet to receive your LBT tokens.
          </p>
        )}

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

        <p className="mt-6 flex items-start gap-3 border-t border-line pt-5 text-sm text-muted">
          <UserPlus className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          Your wallet also gives you a referral link. Realtors you refer to the course earn you LBT.
        </p>
      </Panel>
    </Reveal>
  );
}
