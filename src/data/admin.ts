// What is left of the admin mock: the payments page, and nothing else. Every other
// admin surface reads the real API now, so the directories, the KPI counters and the
// audit feed that used to live here are gone.
//
// Payments stays mock because there is no payment model on the server at all: no
// transaction, invoice, subscription or billing collection, and no gateway. These rows
// are a picture of a feature, not a record of one (Phase 9+).

import { realtors, realtorById } from "@/data/mock";
import { TIERS } from "@/data/pricing";

const CERTIFICATION_FEE = 75_000; // one-time, prerequisite to list

// Which subscription tier each realtor sits on. Drives MRR + the plan column.
const realtorPlan: Record<string, "starter" | "professional" | "max"> = {
  r1: "max",
  r2: "professional",
  r3: "professional",
  r4: "starter",
  r5: "max",
  r6: "professional",
  r7: "professional",
  r8: "starter",
  r9: "starter",
  r10: "professional",
};

const tierMonthly = (id: string) => TIERS.find((t) => t.id === id)?.monthly ?? 0;

/** Monthly recurring revenue across all paid subscriptions. */
const mrr = realtors.reduce(
  (sum, r) => sum + tierMonthly(realtorPlan[r.id] ?? "starter"),
  0,
);

export type TxnKind = "subscription" | "certification";
export type TxnStatus = "paid" | "pending" | "failed";

export interface Transaction {
  id: string;
  kind: TxnKind;
  realtorId: string;
  amount: number;
  tier?: string; // for subscriptions
  at: string; // relative label
  status: TxnStatus;
}

export const transactions: Transaction[] = [
  { id: "t1", kind: "subscription", realtorId: "r5", amount: 60_000, tier: "Max", at: "1 hour ago", status: "paid" },
  { id: "t2", kind: "certification", realtorId: "r6", amount: CERTIFICATION_FEE, at: "3 hours ago", status: "paid" },
  { id: "t4", kind: "subscription", realtorId: "r2", amount: 25_000, tier: "Professional", at: "Yesterday", status: "paid" },
  { id: "t6", kind: "certification", realtorId: "r4", amount: CERTIFICATION_FEE, at: "2 days ago", status: "failed" },
  { id: "t7", kind: "subscription", realtorId: "r1", amount: 60_000, tier: "Max", at: "2 days ago", status: "paid" },
  { id: "t9", kind: "subscription", realtorId: "r7", amount: 25_000, tier: "Professional", at: "4 days ago", status: "paid" },
  { id: "t10", kind: "certification", realtorId: "r9", amount: CERTIFICATION_FEE, at: "5 days ago", status: "paid" },
  { id: "t11", kind: "subscription", realtorId: "r10", amount: 25_000, tier: "Professional", at: "6 days ago", status: "paid" },
];

const sumBy = (kind: TxnKind) =>
  transactions
    .filter((t) => t.kind === kind && t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);

export const revenue = {
  mrr,
  certification: sumBy("certification"),
};

// The payments table names the realtor behind each row.
export { realtorById };
