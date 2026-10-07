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

export const WALLET_KEY = ["wallet"];

export const CHAIN_NAMES: Record<string, string> = { BSC: "BNB Smart Chain" };

export function useWallet() {
  return useQuery({
    queryKey: WALLET_KEY,
    queryFn: async () => (await api.get<WalletResponse>("/wallets/me")).data.data.wallet,
  });
}

export function useOpenWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => (await api.post<WalletResponse>("/wallets")).data.data.wallet,
    onSuccess: (wallet) => queryClient.setQueryData(WALLET_KEY, wallet),
  });
}
