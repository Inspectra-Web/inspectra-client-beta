// Mock data for the signed-in realtor dashboard (identity, portfolio, leads, inspections,
// activity). This is the realtor's own operating data, distinct from the marketplace
// realtors in mock.ts. Listing ids reference real properties in mock.ts so cards/thumbnails
// resolve. UI over mock data (Phase 6): no backend, no persistence.

import type { VerificationStatus } from "@/types";

export type SocialKind = "instagram" | "linkedin" | "facebook" | "x";

export interface RealtorProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  agency: string;
  role: string;
  email: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  certified: boolean;
  memberSince: string;
  selfDescription: string;
  experience: string;
  specialization: string[];
  agencyAddress: string;
  region: string;
  propertiesListed: number;
  languages: string;
  availabilityStatus: string;
  contactMeans: string;
  gender: string;
  socials: { label: string; href: string; kind: SocialKind }[];
  governmentId: { label: string; status: VerificationStatus };
}

export const realtor: RealtorProfile = {
  id: "r1",
  name: "Adaeze Okonkwo",
  firstName: "Adaeze",
  lastName: "Okonkwo",
  middleName: "",
  agency: "Meridian Property Partners",
  role: "Senior Realtor",
  email: "adaeze@meridianpartners.ng",
  avatar:
    "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
  phone: "+234 802 345 6677",
  whatsapp: "+234 802 345 6677",
  address: "7 Admiralty Crescent, Lekki Phase 1",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  certified: true,
  memberSince: "January 2025",
  selfDescription:
    "Lagos-based realtor specializing in verified waterfront and serviced homes across Ikoyi and Lekki. I put trust first: every listing I bring is document-checked before it reaches you, so you can move with confidence.",
  experience: "8 years in luxury real estate",
  specialization: ["Waterfront homes", "Serviced apartments"],
  agencyAddress: "7 Admiralty Crescent, Lekki Phase 1, Lagos",
  region: "Lagos Island & Mainland",
  propertiesListed: 6,
  languages: "English, Yoruba",
  availabilityStatus: "Available",
  contactMeans: "Phone & WhatsApp",
  gender: "Female",
  socials: [
    { label: "Instagram", href: "#", kind: "instagram" },
    { label: "LinkedIn", href: "#", kind: "linkedin" },
  ],
  governmentId: { label: "Government-issued ID", status: "pending" },
};

/** A larger portrait of the realtor for the credential card (same photo, not face-cropped). */
export const realtorPortrait =
  "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=crop&w=900&q=80";

// Certification is one-time and terminal: once earned it's permanent (no expiry / renewal).
export type CertStatus = "certified" | "in-progress" | "not-enrolled";
export interface Certification {
  status: CertStatus;
  credentialId: string;
  issuedOn: string; // ISO, permanent
  examScore: number; // percent
  examDate: string; // ISO
  completedModules: number; // 0..6
}

export const certification: Certification = {
  status: "certified",
  credentialId: "INS-CR-2025-0142",
  issuedOn: "2025-01-20",
  examScore: 88,
  examDate: "2025-01-18",
  completedModules: 6,
};

/** The realtor's own portfolio. Curated to span verification states so the trust panel bites.
 *  `views` / `leads` are the per-listing performance a realtor actually watches. */
export interface ListingStat {
  id: string; // property id in mock.ts
  views: number;
  leads: number;
}

export const myListings: ListingStat[] = [
  { id: "p1", views: 1284, leads: 9 }, // verified
  { id: "p13", views: 642, leads: 4 }, // verified
  { id: "p10", views: 411, leads: 3 }, // verified
  { id: "p18", views: 233, leads: 1 }, // verified
  { id: "p7", views: 176, leads: 2 }, // pending
  { id: "p16", views: 88, leads: 0 }, // disputed
];

export type LeadStatus = "new" | "responded";
export interface Lead {
  id: string;
  propertyId: string;
  buyerName: string;
  buyerAvatar: string;
  message: string;
  at: string;
  status: LeadStatus;
  reply?: string;
}

export const leads: Lead[] = [
  {
    id: "l1",
    propertyId: "p1",
    buyerName: "Chinedu Okafor",
    buyerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80",
    message:
      "Is the waterfront duplex still available? I'd like to schedule a viewing this week.",
    at: "20 min ago",
    status: "new",
  },
  {
    id: "l2",
    propertyId: "p13",
    buyerName: "Amara Okeke",
    buyerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80",
    message: "Could you confirm the service charge and whether the C of O is ready?",
    at: "2 hours ago",
    status: "new",
  },
  {
    id: "l3",
    propertyId: "p10",
    buyerName: "Bola Ahmed",
    buyerAvatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80",
    message: "What's the earliest move-in date for the apartment?",
    at: "Yesterday",
    status: "responded",
    reply:
      "Hi Bola, the apartment is available from the 1st of next month. Happy to arrange a viewing this week.",
  },
  {
    id: "l4",
    propertyId: "p18",
    buyerName: "Ngozi Umeh",
    buyerAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=3&w=96&h=96&q=80",
    message: "Is the price negotiable for a cash buyer?",
    at: "2 days ago",
    status: "responded",
    reply:
      "Thanks Ngozi. There's room to negotiate for a serious cash buyer, let's talk. When works for a quick call?",
  },
];

export type RealtorInspectionMode = "in-person" | "virtual";
export type RealtorInspectionStatus = "upcoming" | "completed" | "cancelled";
export interface RealtorInspection {
  id: string;
  propertyId: string;
  buyerName: string;
  date: string; // ISO, near today (2026-07-12)
  time: string;
  mode: RealtorInspectionMode;
  status: RealtorInspectionStatus;
}

export const realtorInspections: RealtorInspection[] = [
  {
    id: "i1",
    propertyId: "p1",
    buyerName: "Chinedu Okafor",
    date: "2026-07-14",
    time: "11:00 AM",
    mode: "in-person",
    status: "upcoming",
  },
  {
    id: "i2",
    propertyId: "p13",
    buyerName: "Amara Okeke",
    date: "2026-07-16",
    time: "3:30 PM",
    mode: "virtual",
    status: "upcoming",
  },
  {
    id: "i3",
    propertyId: "p10",
    buyerName: "Bola Ahmed",
    date: "2026-07-19",
    time: "10:00 AM",
    mode: "in-person",
    status: "upcoming",
  },
  {
    id: "i4",
    propertyId: "p1",
    buyerName: "Fatima Sani",
    date: "2026-07-08",
    time: "1:00 PM",
    mode: "in-person",
    status: "completed",
  },
  {
    id: "i5",
    propertyId: "p13",
    buyerName: "Emeka Nwafor",
    date: "2026-07-05",
    time: "4:00 PM",
    mode: "virtual",
    status: "completed",
  },
  {
    id: "i6",
    propertyId: "p10",
    buyerName: "Grace Ade",
    date: "2026-07-01",
    time: "11:30 AM",
    mode: "in-person",
    status: "cancelled",
  },
];

export type RealtorActivityKind = "lead" | "inspection" | "verified" | "listed";
export interface RealtorActivity {
  id: string;
  kind: RealtorActivityKind;
  text: string;
  at: string;
}

export const realtorActivity: RealtorActivity[] = [
  { id: "ra1", kind: "lead", text: "New lead from Chinedu Okafor on Waterfront Duplex", at: "20m ago" },
  { id: "ra2", kind: "inspection", text: "Amara Okeke booked a virtual tour", at: "2h ago" },
  { id: "ra4", kind: "verified", text: "Studio Apartment, Yaba entered verification review", at: "Yesterday" },
  { id: "ra5", kind: "listed", text: "You listed a new property in Lekki Phase 1", at: "2d ago" },
];

/** New leads still awaiting a first reply. */
export const newLeadCount = leads.filter((l) => l.status === "new").length;

/** Inspections still ahead, earliest first. */
export const upcomingRealtorInspections = realtorInspections
  .filter((i) => i.status === "upcoming")
  .sort((a, b) => a.date.localeCompare(b.date));

export const myListingStat = (id: string) => myListings.find((l) => l.id === id);
export const leadById = (id: string) => leads.find((l) => l.id === id);
export const realtorInspectionById = (id: string) =>
  realtorInspections.find((i) => i.id === id);
