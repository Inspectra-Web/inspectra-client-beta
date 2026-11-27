import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

export interface Wallet {
  address: string;
  blockchain: string;
  status: "pending" | "active";
  activatedAt?: string;
}

interface WalletResponse {
  status: string;
  data: { wallet: Wallet | null };
}

export interface TokenBalance {
  /** A decimal string in token units. Never parsed to a number: 18 decimals overflow one. */
  amount: string;
  symbol: string;
  name: string;
  decimals: number;
  standard: string;
}

export interface BalancesResponse {
  status: string;
  data: { balances: TokenBalance[] | null };
}

/** LBT earned on the platform: one for the realtor's own course, one per course a realtor they referred paid for. */
export interface Reward {
  id: string;
  source: "course" | "referral";
  /** On a referral: the first name of the realtor referred. */
  referredName?: string;
  earnedAt?: string;
  status: "delivered" | "on_its_way" | "delayed";
  /** A decimal string, known once the purchase is quoted. */
  tokens: string | null;
  symbol: string;
  explorerUrl: string | null;
  deliveredAt: string | null;
}

interface RewardsResponse {
  status: string;
  data: { rewards: Reward[] };
}

export const WALLET_KEY = ["wallet"];
export const WALLET_BALANCES_KEY = ["wallet", "balances"];
export const WALLET_REWARDS_KEY = ["wallet", "rewards"];
export const WALLET_REFERRAL_KEY = ["wallet", "referral"];
export const TOKEN_PRICES_KEY = ["wallet", "prices"];

/** Naira and dollars per token, decimal strings. Null when that currency has no price. */
export interface TokenPrice {
  ngn: string | null;
  usd: string | null;
}

/** LBT from LambaCard, BNB from the market. A token whose price could not be had is null. */
export type TokenPrices = Record<"LBT" | "BNB", TokenPrice | null>;

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: value >= 100 ? 0 : 2 })}`;

const dollars = (value: number) =>
  value > 0 && value < 0.01
    ? "<$0.01"
    : `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * What an amount of a token is worth today: "≈ ₦3,387 · $2.14". Null when the token has no
 * price, so the caller shows nothing rather than a guess. Display only: the amount is cut
 * to a number here, which is fine for a rounded value and never used for money.
 */
export function tokenValue(amount: string, symbol: string, prices: TokenPrices | undefined): string | null {
  const price = prices?.[symbol as keyof TokenPrices];
  if (!price) return null;

  const tokens = Number(amount);
  const parts = [
    price.ngn !== null && naira(tokens * Number(price.ngn)),
    price.usd !== null && dollars(tokens * Number(price.usd)),
  ].filter(Boolean);

  return parts.length ? `≈ ${parts.join(" · ")}` : null;
}

/** The realtor's referral link and what it has earned. Counts only paid courses. */
export interface Referral {
  code: string;
  link: string;
  referred: number;
  delivered: number;
  /** A decimal string of LBT from delivered referrals. */
  tokens: string;
  symbol: string;
}

export const CHAIN_NAMES: Record<string, string> = { BSC: "BNB Smart Chain" };

const SHOWN_DECIMALS = 6;

/** "1234.500000000000000000" -> "1,234.5". Cut, not rounded, past six decimals. */
export function formatTokenAmount(amount: string) {
  const [whole = "0", fraction = ""] = amount.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cut = fraction.slice(0, SHOWN_DECIMALS).replace(/0+$/, "");

  // Dust below the shown precision must not read as an empty wallet.
  if (!cut && whole === "0" && /[1-9]/.test(fraction)) return `<0.${"0".repeat(SHOWN_DECIMALS - 1)}1`;

  return cut ? `${grouped}.${cut}` : grouped;
}

export function useWallet() {
  return useQuery({
    queryKey: WALLET_KEY,
    queryFn: async () => (await api.get<WalletResponse>("/wallets/me")).data.data.wallet,
  });
}

export function useWalletBalances() {
  return useQuery({
    queryKey: WALLET_BALANCES_KEY,
    queryFn: async () => (await api.get<BalancesResponse>("/wallets/me/balances")).data.data.balances,
  });
}

export function useWalletRewards() {
  return useQuery({
    queryKey: WALLET_REWARDS_KEY,
    queryFn: async () => (await api.get<RewardsResponse>("/wallets/me/rewards")).data.data.rewards,
  });
}

/** Kept for five minutes, as long as the server keeps them. */
export function useTokenPrices() {
  return useQuery({
    queryKey: TOKEN_PRICES_KEY,
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await api.get<{ status: string; data: { prices: TokenPrices } }>("/wallets/prices")).data.data.prices,
  });
}

/** Only a realtor with an active wallet has a referral link, so ask only then. */
export function useMyReferral(enabled: boolean) {
  return useQuery({
    queryKey: WALLET_REFERRAL_KEY,
    enabled,
    queryFn: async () =>
      (await api.get<{ status: string; data: { referral: Referral } }>("/wallets/me/referral")).data.data.referral,
  });
}

export function useOpenWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => (await api.post<WalletResponse>("/wallets")).data.data.wallet,
    onSuccess: (wallet) => queryClient.setQueryData(WALLET_KEY, wallet),
  });
}
