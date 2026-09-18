import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type { Cadence, PaymentStatus, Tier } from "./subscription";

/**
 * The platform payment ledger, for the admin console.
 *
 * Separate from `lib/subscription.ts`, which is a realtor reading their own plan. This
 * one reads everybody's, and only an admin can.
 */

export type LedgerFilter = PaymentStatus | "all";

export interface LedgerPayment {
  id: string;
  reference: string;
  tier?: Tier;
  cadence?: Cadence;
  amount: number;
  status: PaymentStatus;
  channel: string;
  cardLast4: string;
  paidAt?: string;
  periodEnd?: string;
  createdAt: string;
  realtor: {
    id: string;
    fullname: string;
    email: string;
    avatar: string;
  };
}

export interface LedgerPlan {
  tier: Tier;
  name: string;
  count: number;
  /** Of `count`, the ones already cancelled: live now, gone at the period end. */
  ending: number;
  monthly: number;
}

/**
 * What the ledger adds up to.
 *
 * There is no MRR here on purpose. Nothing auto-renews, so a recurring figure would be a
 * projection dressed as a measurement. `monthlyValue` is what the plans currently held
 * are worth a month, which is a different and honest claim.
 */
export interface LedgerRevenue {
  collected: number;
  thisMonth: number;
  activePlans: number;
  endingPlans: number;
  monthlyValue: number;
  plans: LedgerPlan[];
}

export interface LedgerPage {
  payments: LedgerPayment[];
  counts: Record<LedgerFilter, number>;
  revenue: LedgerRevenue;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LedgerQuery {
  q: string;
  status: LedgerFilter;
  page: number;
}

interface LedgerResponse {
  status: string;
  data: LedgerPage;
}

export const ADMIN_PAYMENTS_KEY = ["admin", "payments"];

/** The resting query the ledger opens on. */
export const LEDGER_QUERY: LedgerQuery = { q: "", status: "all", page: 1 };

// Mirrors the default in server/src/validators/payment.validator.ts.
export const PAGE_SIZE = 12;

export function useAdminPayments(query: LedgerQuery) {
  return useQuery({
    queryKey: [...ADMIN_PAYMENTS_KEY, query],
    queryFn: async () => {
      const res = await api.get<LedgerResponse>("/admin/payments", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** How a payment was made, for the method column. */
export function ledgerMethod(payment: LedgerPayment): string {
  if (payment.cardLast4) return `Card ····${payment.cardLast4}`;
  if (payment.channel === "banktransfer") return "Bank transfer";
  return payment.channel || "-";
}
