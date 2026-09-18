import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./api";

/**
 * The realtor's plan, the catalogue behind it, and the receipts.
 *
 * The catalogue is fetched rather than read from `src/data/pricing.ts`: the server
 * decides what a plan costs and what it allows, and a card quoting a price the API
 * would not charge is the one thing this seam exists to prevent. The marketing copy
 * (taglines, feature bullets) still lives client-side, because the API holds no ad copy.
 */

export type Tier = "starter" | "professional" | "business" | "elite";
export type Cadence = "monthly" | "quarterly" | "annual";
export type SubscriptionStatus = "active" | "past_due" | "canceled";
// No "canceled": an attempt nobody completed is deleted server-side rather than kept
// as a row the console would never show.
export type PaymentStatus = "pending" | "paid" | "failed";

export interface Plan {
  tier: Tier;
  name: string;
  monthly: number;
  listings: number;
  refreshes: number;
  leadReply: boolean;
  leadContact: boolean;
  analytics: "none" | "basic" | "conversion" | "advanced";
  reviewPriority: "standard" | "priority" | "top";
}

export interface PlanPrice {
  cadence: Cadence;
  months: number;
  discount: number;
  amount: number;
  savings: number;
}

export type CataloguePlan = Plan & { prices: PlanPrice[] };

export interface Subscription {
  id: string;
  tier: Tier;
  cadence: Cadence;
  status: SubscriptionStatus;
  startedAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  graceEndsAt?: string;
  canceledAt?: string;
  refreshesUsed: number;
}

export interface Allowance {
  limit: number;
  used: number;
  remaining: number;
}

export interface Payment {
  id: string;
  reference: string;
  kind: "subscription" | "certification";
  tier?: Tier;
  cadence?: Cadence;
  amount: number;
  currency: string;
  status: PaymentStatus;
  channel: string;
  cardLast4: string;
  cardBrand: string;
  paidAt?: string;
  periodStart?: string;
  periodEnd?: string;
  createdAt: string;
}

export interface SubscriptionState {
  subscription: Subscription;
  plan: Plan;
  allowance: Allowance;
}

interface SubscriptionResponse {
  status: string;
  message?: string;
  data: SubscriptionState;
}

interface PlansResponse {
  status: string;
  data: { plans: CataloguePlan[] };
}

export type PaymentFilter = PaymentStatus | "all";

export interface PaymentsQuery {
  status: PaymentFilter;
  page: number;
}

export interface PaymentsPage {
  payments: Payment[];
  counts: Record<PaymentFilter, number>;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PaymentsResponse {
  status: string;
  data: PaymentsPage;
}

interface PaymentResponse {
  status: string;
  message?: string;
  data: { payment: Payment };
}

interface CheckoutResponse {
  status: string;
  data: { link: string; reference: string; amount: number };
}

interface VerifyResponse {
  status: string;
  message?: string;
  data: SubscriptionState & { payment: Payment };
}

export const SUBSCRIPTION_KEY = ["subscription"];
export const PLANS_KEY = ["subscription", "plans"];
export const PAYMENTS_KEY = ["payments"];

/** The realtor's own plan. One cache entry, shared by the page and any sidebar pill. */
export function useSubscription() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: async () => {
      const res = await api.get<SubscriptionResponse>("/subscription/me");
      return res.data.data;
    },
  });
}

/** Public, and rarely changes, so it rests for an hour rather than per page view. */
export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: async () => {
      const res = await api.get<PlansResponse>("/subscription/plans");
      return res.data.data.plans;
    },
    staleTime: 60 * 60 * 1000,
  });
}

// Mirrors the default in server/src/validators/payment.validator.ts.
export const PAYMENTS_PAGE_SIZE = 12;

/**
 * The resting query behind the "awaiting payment" panel.
 *
 * Separate from whatever the table below is filtered to, on purpose: an attempt the
 * realtor still has to finish or drop must not disappear because they were looking at
 * their receipts.
 */
export const PENDING_QUERY: PaymentsQuery = { status: "pending", page: 1 };

/** The resting query behind the payment-method line: the most recent settled charge. */
export const PAID_QUERY: PaymentsQuery = { status: "paid", page: 1 };

export function usePayments(query: PaymentsQuery) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, query],
    queryFn: async () => {
      const res = await api.get<PaymentsResponse>("/payments/me", {
        params: { ...query, limit: PAYMENTS_PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Starts a checkout and hands the browser to Flutterwave.
 *
 * The amount is deliberately not sent: the server prices the tier itself. The redirect
 * is a full page navigation rather than a new tab, because a bank's 3DS step can take
 * minutes and a popup is the thing people close by accident.
 */
export function useCheckout() {
  return useMutation({
    mutationFn: async (input: { tier: Tier; cadence: Cadence }) => {
      const res = await api.post<CheckoutResponse>("/payments/subscription", input);
      return res.data.data;
    },
    onSuccess: ({ link }) => {
      window.location.assign(link);
    },
  });
}

/**
 * Confirms a payment after Flutterwave sends the realtor back.
 *
 * Deliberately a query, not a mutation, for the same reason `VerifyEmail` uses one:
 * React 19 StrictMode remounts in dev and would fire the POST twice. The query cache
 * dedupes by key, so the remount joins the same in-flight promise. The endpoint is
 * idempotent regardless, and the webhook has usually settled the payment before the
 * realtor's browser even gets back, so a replay answers with the same state.
 */
export function useVerifyPayment(reference: string, transactionId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: async () => {
      const res = await api.post<VerifyResponse>(`/payments/${reference}/verify`, {
        transactionId,
      });

      const { payment, ...state } = res.data.data;

      queryClient.setQueryData<SubscriptionState>(SUBSCRIPTION_KEY, state);
      void queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      // The listing cap just moved, so whatever renders it is stale.
      void queryClient.invalidateQueries({ queryKey: ["profile"] });

      return { payment, ...state };
    },
    enabled: reference.length > 0 && transactionId.length > 0,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/** How the last payment was made, for the payment-method line. */
export function paymentMethod(payment: Payment | undefined): string {
  if (!payment) return "";
  if (payment.cardLast4)
    return `${payment.cardBrand || "Card"} ending ${payment.cardLast4}`;

  return payment.channel === "banktransfer"
    ? "Bank transfer"
    : payment.channel || "Card";
}

/**
 * One payment in full, seeded from the row that opened it.
 *
 * `initialData` means the panel paints immediately with what the list already had, then
 * quietly reconciles. A receipt the realtor clicked a moment ago should not show them a
 * spinner over data that is already on screen.
 */
export function usePayment(reference: string, initial?: Payment) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, reference],
    queryFn: async () => {
      const res = await api.get<PaymentResponse>(`/payments/${reference}`);
      return res.data.data.payment;
    },
    enabled: reference.length > 0,
    initialData: initial,
  });
}

/** Drops an attempt the realtor decided against. The row is deleted, so nothing
 *  comes back but the confirmation. */
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await api.patch<{ status: string; message?: string }>(
        `/payments/${reference}/cancel`,
      );
      return res.data.message;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
    },
  });
}

/**
 * Stops the plan renewing. Nothing is refunded and nothing is taken away: the period
 * already paid for runs to its end, which is why this returns the same live state.
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.patch<SubscriptionResponse>("/subscription/me/cancel");
      return res.data;
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData<SubscriptionState>(SUBSCRIPTION_KEY, data);
    },
  });
}

