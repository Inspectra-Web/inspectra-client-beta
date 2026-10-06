import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type { AuthStatus } from "./auth";
import type { Balance, VirtualAccount } from "./virtualAccount";

/** A directory row: the account, plus the realtor it belongs to. */
export interface AdminVirtualAccountRow extends VirtualAccount {
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
export interface VirtualAccountCounts {
  all: number;
  active: number;
  pending: number;
}

export interface VirtualAccountDirectory {
  accounts: AdminVirtualAccountRow[];
  counts: VirtualAccountCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface VirtualAccountQuery {
  q: string;
  status: VirtualAccount["status"] | "all";
  page: number;
}

/** One realtor's account as the admin sees it: the realtor's own view plus two dates. */
export interface AdminVirtualAccount extends VirtualAccount {
  consentedAt?: string;
  createdAt: string;
}

export interface RealtorVirtualAccount {
  account: AdminVirtualAccount | null;
  balance: Balance | null;
}

interface DirectoryResponse {
  status: string;
  data: VirtualAccountDirectory;
}

interface RealtorAccountResponse {
  status: string;
  data: RealtorVirtualAccount;
}

export const ADMIN_VIRTUAL_ACCOUNTS_KEY = ["admin", "virtual-accounts"];

export const VIRTUAL_ACCOUNTS_QUERY: VirtualAccountQuery = {
  q: "",
  status: "all",
  page: 1,
};

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

export function useAdminVirtualAccounts(query: VirtualAccountQuery) {
  return useQuery({
    queryKey: [...ADMIN_VIRTUAL_ACCOUNTS_KEY, query],
    queryFn: async () => {
      const res = await api.get<DirectoryResponse>("/admin/virtual-accounts", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminRealtorVirtualAccount(realtorId: string) {
  return useQuery({
    queryKey: [...ADMIN_VIRTUAL_ACCOUNTS_KEY, "realtor", realtorId],
    queryFn: async () => {
      const res = await api.get<RealtorAccountResponse>(
        `/admin/realtors/${realtorId}/virtual-account`,
      );
      return res.data.data;
    },
  });
}
