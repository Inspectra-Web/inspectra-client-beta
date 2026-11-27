import { Link } from "react-router";
import { Check, Copy, ExternalLink, UserPlus } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { TokenValue } from "@/components/realtor/TokenValue";
import { apiMessage } from "@/lib/api";
import { useCopy } from "@/lib/clipboard";
import { formatDate } from "@/lib/format";
import {
  formatTokenAmount,
  useMyReferral,
  useWallet,
  useWalletRewards,
  type Referral,
  type Reward,
} from "@/lib/wallet";
import { cn } from "@/lib/cn";

const SKELETON = <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />;

/**
 * The realtor's referral link, what it has earned, and each referral's reward. On the wallet
 * page and the account page's Referral tab. Only a realtor with an active wallet can refer,
 * so without one it points them to the wallet page and asks for no link.
 */
export function ReferralCard() {
  const wallet = useWallet();
  const active = wallet.data?.status === "active";

  if (wallet.isPending) return SKELETON;
  if (!active) return <NoWalletYet />;

  return <ReferralDetails />;
}

function NoWalletYet() {
  return (
    <Reveal y={16}>
      <Panel className="max-w-2xl">
        <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
          <UserPlus className="size-6" aria-hidden />
        </span>
        <h2 className="display mt-5 text-2xl text-ink">Refer a realtor</h2>
        <p className="mt-2 text-muted">
          Your referral link comes with your wallet, because that is where your referral rewards land.
          Create your wallet to get your link and code.
        </p>
        <Link to="/realtor/wallet" className="mt-5 inline-flex text-sm font-semibold text-brand-ink hover:underline">
          Create your wallet
        </Link>
      </Panel>
    </Reveal>
  );
}

function ReferralDetails() {
  const { data: referral, isPending, isError, error } = useMyReferral(true);
  const { data: rewards } = useWalletRewards();
  const referrals = rewards?.filter((reward) => reward.source === "referral") ?? [];

  if (isPending) return SKELETON;

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
              sent to your wallet.
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

  const stats: [string, string, string?][] = [
    ["Realtors referred", String(referral.referred)],
    ["Rewards received", String(referral.delivered)],
    ["Earned", `${formatTokenAmount(referral.tokens)} ${referral.symbol}`, referral.tokens],
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
        {stats.map(([label, value, tokens]) => (
          <div key={label} className="rounded-xl bg-surface-2/60 px-4 py-3 last:max-sm:col-span-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-ink">{value}</dd>
            {tokens && Number(tokens) > 0 && (
              <dd>
                <TokenValue amount={tokens} symbol={referral.symbol} className="truncate text-xs" />
              </dd>
            )}
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
      {amount && reward.tokens && (
        <div className="shrink-0 text-right max-sm:text-left">
          <p className="font-semibold tabular-nums text-ink">{amount}</p>
          <TokenValue amount={reward.tokens} symbol={reward.symbol} className="text-xs" />
        </div>
      )}
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
