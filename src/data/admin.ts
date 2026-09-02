// Mock data for the signed-in admin (the "Trust Operations" back office). This is the
// platform-side view: the queue of listings waiting on a human decision, the people
// directory, revenue, and an audit feed. It reads from the same marketplace mock
// (properties + realtors in mock.ts) so nothing drifts, and adds only what admin
// uniquely needs. UI over mock data (Phase 8): no backend, no persistence.

import type { Property, Realtor, VerificationStatus } from "@/types";
import { properties, realtors, propertyById, realtorById } from "@/data/mock";
import { seeker, inquiries, inspections } from "@/data/seeker";
import { leads, realtorInspections } from "@/data/realtor";
import { TIERS } from "@/data/pricing";
import { realtorMeta } from "@/lib/realtorMeta";

/* ------------------------------------------------------------------ *
 * Admin identity
 * ------------------------------------------------------------------ */

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  memberSince: string;
}

export const admin: AdminProfile = {
  name: "Ifeoma Balogun",
  email: "ifeoma@inspectraweb.com",
  role: "Trust Operations",
  avatar:
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
  memberSince: "October 2024",
};

/* ------------------------------------------------------------------ *
 * Verification queue: every listing waiting on a human decision.
 * Submission metadata is keyed by property id; the queue itself is
 * derived from the marketplace listings that are not yet verified.
 * ------------------------------------------------------------------ */

export interface Submission {
  submittedAt: string; // relative label, e.g. "2 days ago"
  submittedBy: string; // realtor id
  note?: string; // why it is sitting in the queue
}

const SUBMISSIONS: Record<string, Submission> = {
  p7: { submittedAt: "3 hours ago", submittedBy: "r1", note: "Tenancy agreement in review." },
  p11: { submittedAt: "1 day ago", submittedBy: "r3", note: "Awaiting C of O confirmation." },
  p15: { submittedAt: "2 days ago", submittedBy: "r1", note: "Excision gazette needs a manual check." },
  p19: { submittedAt: "4 days ago", submittedBy: "r4", note: "Realtor not yet certified." },
  p9: { submittedAt: "6 days ago", submittedBy: "r4", note: "Buyer flagged the survey plan." },
  p16: { submittedAt: "8 days ago", submittedBy: "r3", note: "Title dispute raised on the C of O." },
};

export const submissionFor = (id: string): Submission | undefined => SUBMISSIONS[id];

// Disputed first, then oldest-pending first, so the most urgent work rises to the top.
const QUEUE_ORDER: Record<VerificationStatus, number> = { disputed: 0, pending: 1, verified: 2 };

export interface QueueItem {
  property: Property;
  realtor?: Realtor;
  submission?: Submission;
}

export const reviewQueue: QueueItem[] = properties
  .filter((p) => p.status !== "verified")
  .map((property) => ({
    property,
    realtor: realtorById(property.realtorId),
    submission: SUBMISSIONS[property.id],
  }))
  .sort((a, b) => QUEUE_ORDER[a.property.status] - QUEUE_ORDER[b.property.status]);

/* ------------------------------------------------------------------ *
 * People directory: seekers, realtors and admins in one list.
 * ------------------------------------------------------------------ */

export type UserRole = "seeker" | "realtor" | "admin";
export type UserStatus = "active" | "suspended" | "pending";

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
  status: UserStatus;
  joined: string;
  avatar: string;
  refId?: string; // links realtor rows back to their realtor id
}

// A stable email from a display name, so realtor rows read like real accounts.
const emailFor = (name: string, agency: string) =>
  `${name.split(" ")[0].toLowerCase()}@${agency.toLowerCase().replace(/[^a-z]+/g, "")}.ng`;

const JOIN_DATES = [
  "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025",
  "Jun 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025",
];

export const directoryUsers: DirectoryUser[] = [
  {
    id: "u-admin",
    name: admin.name,
    email: admin.email,
    role: "admin",
    city: "Lagos",
    status: "active",
    joined: admin.memberSince,
    avatar: admin.avatar,
  },
  {
    id: "u-seeker",
    name: seeker.name,
    email: seeker.email,
    role: "seeker",
    city: seeker.city,
    status: "active",
    joined: seeker.memberSince,
    avatar: seeker.avatar,
  },
  // A few more seekers so the directory reads like a real userbase.
  {
    id: "u-seeker-2",
    name: "Chinedu Okafor",
    email: "chinedu.okafor@gmail.com",
    role: "seeker",
    city: "Abuja",
    status: "active",
    joined: "Apr 2025",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80",
  },
  {
    id: "u-seeker-3",
    name: "Ngozi Umeh",
    email: "ngozi.umeh@gmail.com",
    role: "seeker",
    city: "Port Harcourt",
    status: "suspended",
    joined: "May 2025",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80",
  },
  ...realtors.map<DirectoryUser>((r, i) => ({
    id: `u-${r.id}`,
    name: r.name,
    email: emailFor(r.name, r.agency),
    role: "realtor",
    city: r.city,
    status: r.certified ? "active" : "pending",
    joined: JOIN_DATES[i] ?? "2025",
    avatar: `${r.avatar}?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80`,
    refId: r.id,
  })),
];

export const userById = (id: string) => directoryUsers.find((u) => u.id === id);

/* ------------------------------------------------------------------ *
 * Revenue: subscriptions, one-time certification, per-inspection fees.
 * Amounts are internal back-office figures (this surface may show them).
 * ------------------------------------------------------------------ */

export const CERTIFICATION_FEE = 75_000; // one-time, prerequisite to list

// Which subscription tier each realtor sits on. Drives MRR + the plan column.
export const realtorPlan: Record<string, "starter" | "professional" | "max"> = {
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
export const mrr = realtors.reduce((sum, r) => sum + tierMonthly(realtorPlan[r.id] ?? "starter"), 0);

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
  transactions.filter((t) => t.kind === kind && t.status === "paid").reduce((s, t) => s + t.amount, 0);

export const revenue = {
  mrr,
  certification: sumBy("certification"),
};

/* ------------------------------------------------------------------ *
 * Per-realtor certification + identity, synthesized for the admin detail.
 * (The numeric trust score stays in the data model on Realtor.trustScore
 * but is not surfaced in the UI for now.)
 * ------------------------------------------------------------------ */

export interface AdminCertRecord {
  status: "certified" | "not-certified";
  credentialId?: string;
  examScore?: number;
  issuedOn?: string;
}

export function certRecordFor(r: Realtor): AdminCertRecord {
  if (!r.certified) return { status: "not-certified" };
  const n = r.id.replace("r", "").padStart(4, "0");
  return {
    status: "certified",
    credentialId: `INS-CR-2025-${n}`,
    examScore: Math.min(98, r.trustScore - 4),
    issuedOn: "2025",
  };
}

/** Government-ID verification state for a realtor (r1's is defined in realtor.ts). */
export function govIdStatusFor(r: Realtor): VerificationStatus {
  if (!r.certified) return "pending";
  return r.trustScore >= 88 ? "verified" : "pending";
}

/* Full, believable realtor profile for the admin detail view, synthesized
 * deterministically from the lean marketplace realtor so every realtor renders a
 * complete profile (only r1 has a hand-authored one in realtor.ts). */

const GENDER: Record<string, string> = {
  r1: "Female", r2: "Male", r3: "Female", r4: "Male", r5: "Female",
  r6: "Male", r7: "Female", r8: "Male", r9: "Female", r10: "Male",
};
const STATE_BY_CITY: Record<string, string> = {
  Lagos: "Lagos", Abuja: "FCT", "Port Harcourt": "Rivers", Ibadan: "Oyo", Enugu: "Enugu", Kano: "Kano",
};
const LANG_BY_CITY: Record<string, string> = {
  Lagos: "English, Yoruba", Abuja: "English, Hausa", "Port Harcourt": "English, Igbo",
  Ibadan: "English, Yoruba", Enugu: "English, Igbo", Kano: "English, Hausa",
};
const STREETS = [
  "Admiralty Way", "Bourdillon Road", "Aminu Kano Crescent", "Ademola Adetokunbo Street",
  "Peter Odili Road", "Ring Road", "Independence Layout", "Ahmadu Bello Way",
];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export interface AdminRealtorProfile {
  role: string;
  phone: string;
  email: string;
  address: string;
  agencyAddress: string;
  region: string;
  experience: string;
  specialization: string[];
  languages: string;
  availabilityStatus: string;
  contactMeans: string;
  gender: string;
  state: string;
  country: string;
  selfDescription: string;
  socials: { label: string; href: string }[];
  memberSince: string;
}

export function adminRealtorProfile(r: Realtor): AdminRealtorProfile {
  const meta = realtorMeta(r);
  const h = hashStr(r.id + r.name);
  const first = r.name.split(" ")[0];
  const focus = meta.specialties.join(" and ").toLowerCase() || "residential sales";
  const years = Math.min(14, 3 + Math.floor(r.completedDeals / 5));
  const street = `${1 + (h % 90)} ${STREETS[h % STREETS.length]}`;
  const account = directoryUsers.find((u) => u.refId === r.id);
  const phone = `+234 80${h % 8} ${String(100 + (h % 900))} ${String(1000 + (h % 9000))}`;
  const role =
    r.completedDeals >= 50 ? "Principal Realtor" : r.completedDeals >= 30 ? "Senior Realtor" : "Realtor";
  return {
    role,
    phone,
    email: account?.email ?? `${first.toLowerCase()}@inspectraweb.com`,
    address: `${street}, ${r.city}`,
    agencyAddress: `${street}, ${r.city}`,
    region: meta.areas,
    experience: `${years} years in real estate`,
    specialization: meta.specialties,
    languages: LANG_BY_CITY[r.city] ?? "English",
    availabilityStatus: "Available",
    contactMeans: "Phone & WhatsApp",
    gender: GENDER[r.id] ?? "—",
    state: STATE_BY_CITY[r.city] ?? r.city,
    country: "Nigeria",
    selfDescription: `${r.name} is ${r.certified ? "a certified" : "an"} INSPECTRA realtor at ${r.agency}, working across ${meta.areas} in ${r.city}. With ${years} years in the market, ${first} focuses on ${focus} and brings only document-checked listings to buyers.`,
    socials: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
    memberSince: account?.joined ?? "2025",
  };
}

/** The listings a realtor owns, for their admin detail page. */
export const listingsByRealtor = (realtorId: string) =>
  properties.filter((p) => p.realtorId === realtorId);

/* ------------------------------------------------------------------ *
 * Platform KPIs, derived so the command center never drifts from data.
 * ------------------------------------------------------------------ */

const verifiedCount = properties.filter((p) => p.status === "verified").length;
const certifiedCount = realtors.filter((r) => r.certified).length;
// Everyone on a Professional or Agency plan is an active paying subscriber (Starter is free).
const paidSubscriptions = realtors.filter((r) => (realtorPlan[r.id] ?? "starter") !== "starter").length;

export const kpis = {
  totalListings: properties.length,
  verified: verifiedCount,
  pending: properties.filter((p) => p.status === "pending").length,
  disputed: properties.filter((p) => p.status === "disputed").length,
  verifiedRate: Math.round((verifiedCount / properties.length) * 100),
  totalRealtors: realtors.length,
  certifiedRealtors: certifiedCount,
  notCertifiedRealtors: realtors.length - certifiedCount,
  totalUsers: directoryUsers.length,
  // Platform-wide buyer activity, aggregated across seekers and realtors.
  totalLeads: inquiries.length + leads.length,
  totalInspections: inspections.length + realtorInspections.length,
  // Revenue counts: active paid subscriptions and one-time certification fees collected.
  activeSubscriptions: paidSubscriptions,
  certificationsPaid: certifiedCount,
};

/** Count of listings still needing a human (the sidebar queue badge). */
export const queueCount = reviewQueue.length;

/* ------------------------------------------------------------------ *
 * Audit feed for the command center.
 * ------------------------------------------------------------------ */

export type AdminActivityKind = "verified" | "disputed" | "certified" | "listed" | "joined";

export interface AdminActivity {
  id: string;
  kind: AdminActivityKind;
  text: string;
  at: string;
}

export const adminActivity: AdminActivity[] = [
  { id: "ac1", kind: "disputed", text: "Buyer flagged the survey plan on Plot of Dry Land, Ibadan", at: "20m ago" },
  { id: "ac2", kind: "certified", text: "Emeka Obi passed the certification exam", at: "3h ago" },
  { id: "ac3", kind: "verified", text: "You verified Penthouse with City Views, Maitama", at: "5h ago" },
  { id: "ac4", kind: "listed", text: "Chidi Nwosu submitted 2-Bedroom Apartment, Ring Road", at: "Yesterday" },
  { id: "ac5", kind: "joined", text: "Chinedu Okafor created a seeker account", at: "Yesterday" },
  { id: "ac6", kind: "verified", text: "You verified 3-Bedroom Flat, Oniru", at: "2d ago" },
];

// Re-export the resolvers admin pages lean on, so imports stay tidy.
export { propertyById, realtorById };
