import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type { AuthStatus } from "./auth";
import type { Wallet } from "./wallet";

/** A directory row: the wallet, plus the realtor it belongs to. */
export interface AdminWalletRow extends Wallet {
  id: string;
  createdAt: string;
  realtor: {
    id: string;
    /** Stored lowercased by the API. Run it through displayName() to render. */
    fullname: string;
    email: string;
    avatar: string;
    status: AuthStatus;
  };
}

/** Counted before the status filter, so choosing one cannot zero the other. */
export interface WalletCounts {
  all: number;
  active: number;
  pending: number;
}

export interface WalletDirectory {
  wallets: AdminWalletRow[];
  counts: WalletCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface WalletQuery {
  q: string;
  status: Wallet["status"] | "all";
  page: number;
}

export interface AdminWallet extends Wallet {
  createdAt: string;
}

interface DirectoryResponse {
  status: string;
  data: WalletDirectory;
}

interface RealtorWalletResponse {
  status: string;
  data: { wallet: AdminWallet | null };
}

export const ADMIN_WALLETS_KEY = ["admin", "wallets"];

export const WALLETS_QUERY: WalletQuery = {
  q: "",
  status: "all",
  page: 1,
};

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

export function useAdminWallets(query: WalletQuery) {
  return useQuery({
    queryKey: [...ADMIN_WALLETS_KEY, query],
    queryFn: async () => {
      const res = await api.get<DirectoryResponse>("/admin/wallets", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminRealtorWallet(realtorId: string) {
  return useQuery({
    queryKey: [...ADMIN_WALLETS_KEY, "realtor", realtorId],
    queryFn: async () =>
      (await api.get<RealtorWalletResponse>(`/admin/realtors/${realtorId}/wallet`)).data.data.wallet,
  });
}
