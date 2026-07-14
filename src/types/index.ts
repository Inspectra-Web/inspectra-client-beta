/** Verification status carried by a listing — independent of the agent. */
export type VerificationStatus = "verified" | "pending" | "disputed";

/** What a listing is offered as. Sale is one-off; the rest are recurring lets. */
export type ListingFor = "sale" | "rent" | "lease" | "shortlet";

export interface Property {
  id: string;
  ref: string;
  title: string;
  type: "Apartment" | "Duplex" | "Bungalow" | "Land" | "Terrace" | "Penthouse";
  listingFor: ListingFor;
  location: string;
  city: string;
  price: number;
  currency: "NGN";
  beds?: number;
  baths?: number;
  areaSqm?: number;
  status: VerificationStatus;
  documents: string[];
  remoteReady: boolean;
  hasVideo?: boolean;
  image: string;
  realtorId: string;
  coords: { lat: number; lng: number };
}

export interface Realtor {
  id: string;
  name: string;
  agency: string;
  city: string;
  certified: boolean;
  /** Composite trust score 0–100 — deferred from the UI for now. */
  trustScore: number;
  verifiedListings: number;
  completedDeals: number;
  avatar: string;
}
