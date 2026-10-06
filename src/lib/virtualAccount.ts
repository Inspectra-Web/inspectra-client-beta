import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

export interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: string;
  status: "pending" | "active";
  activatedAt?: string;
}

/** In kobo. `available` can move; `booked` also counts credits still clearing. */
export interface Balance {
  booked: number;
  available: number;
}

interface VirtualAccountResponse {
  status: string;
  data: { account: VirtualAccount | null; balance?: Balance | null };
}

export const VIRTUAL_ACCOUNT_KEY = ["virtual-account"];

export const formatKobo = (kobo: number): string =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function useVirtualAccount() {
  return useQuery({
    queryKey: VIRTUAL_ACCOUNT_KEY,
    queryFn: async () => {
      const res = await api.get<VirtualAccountResponse>("/virtual-accounts/me");
      return { account: res.data.data.account, balance: res.data.data.balance ?? null };
    },
  });
}

export function useOpenVirtualAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<VirtualAccountResponse>("/virtual-accounts", { consent: true });
      return res.data.data.account;
    },
    // Re-read rather than patch, so the balance arrives with the new account.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNT_KEY }),
  });
}
