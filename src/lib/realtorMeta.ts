import type { Realtor } from "@/types";

/**
 * Soft profile detail derived deterministically from a realtor — specialty, patch,
 * tenure, response time. Kept out of the data model (like the hidden trust score);
 * these are presentation-only and never expose the trust score.
 */

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const SPECIALTIES = [
  "Luxury homes",
  "Land & titles",
  "Off-plan",
  "Shortlets",
  "Commercial",
  "First-time buyers",
  "Waterfront",
  "Family estates",
  "Investment",
  "Relocation",
];

const AREAS: Record<string, string> = {
  Lagos: "Ikoyi & Lekki",
  Abuja: "Maitama & Asokoro",
  "Port Harcourt": "GRA & Trans-Amadi",
  Ibadan: "Bodija & Jericho",
  Enugu: "GRA & Independence Layout",
  Kano: "Nassarawa GRA",
};

export interface RealtorMeta {
  since: number;
  responseLabel: string;
  specialties: string[];
  areas: string;
  tagline: string;
}

export function realtorMeta(realtor: Realtor): RealtorMeta {
  const h = hash(realtor.id + realtor.name);
  const since = 2024 - Math.min(9, Math.floor(realtor.completedDeals / 8));
  const responseHrs = 1 + (h % 5);
  const s1 = SPECIALTIES[h % SPECIALTIES.length];
  // `>>> 4` (unsigned) — a signed `>> 4` can go negative and index out of bounds.
  const s2 = SPECIALTIES[(h >>> 4) % SPECIALTIES.length];
  const specialties = s1 === s2 ? [s1] : [s1, s2];
  const areas = AREAS[realtor.city] ?? realtor.city;
  return {
    since,
    responseLabel: `Replies in ~${responseHrs}h`,
    specialties,
    areas,
    tagline: `${s1} specialist across ${areas}.`,
  };
}
