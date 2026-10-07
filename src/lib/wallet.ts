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

export const WALLET_KEY = ["wallet"];
export const WALLET_BALANCES_KEY = ["wallet", "balances"];

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

export function useOpenWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => (await api.post<WalletResponse>("/wallets")).data.data.wallet,
    onSuccess: (wallet) => queryClient.setQueryData(WALLET_KEY, wallet),
  });
}
