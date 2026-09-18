// Mock data for the one realtor surface that still has no backend: certification.
// Everything else that used to live here (the portfolio, the activity feed, the lead
// list, and the subscription block, which went when Flutterwave landed) is real now.
// UI over mock data: no backend, no persistence.

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
    { label: "Instagram", href: "https://instagram.com/adaeze.realty", kind: "instagram" },
    { label: "LinkedIn", href: "https://linkedin.com/in/adaeze-okonkwo", kind: "linkedin" },
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
