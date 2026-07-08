/** Verification status carried by a listing — independent of the agent. */
export type VerificationStatus = "verified" | "pending" | "disputed";

export interface Property {
  id: string;
  /** Registry-style reference, rendered in mono. e.g. "LA-2024-08841" */
  ref: string;
  title: string;
  type: "Apartment" | "Duplex" | "Bungalow" | "Land" | "Terrace" | "Penthouse";
  listingFor: "sale" | "rent";
  location: string;
  city: string;
  price: number;
  currency: "NGN";
  beds?: number;
  baths?: number;
  areaSqm?: number;
  status: VerificationStatus;
  /** Documents on file for this parcel. */
  documents: string[];
  remoteReady: boolean;
  image: string;
  realtorId: string;
  /** Approximate parcel coordinates, shown as survey vernacular. */
  coords: { lat: number; lng: number };
}

export interface Realtor {
  id: string;
  name: string;
  agency: string;
  city: string;
  certified: boolean;
  /** Composite trust score 0–100 (mock / admin-set for now). */
  trustScore: number;
  verifiedListings: number;
  completedDeals: number;
  avatar: string;
}

export interface Stat {
  value: string;
  label: string;
}
