/** Verification status carried by a listing — independent of the agent. */
export type VerificationStatus = "verified" | "pending" | "disputed";

/**
 * What a listing is offered as, plus the terminal states it retires into. Sale is
 * one-off; rent, lease and shortlet are recurring lets. Mirrors the API's
 * `listingStatus`, so a sold home still renders instead of coming through blank.
 */
export type ListingFor =
  | "sale"
  | "rent"
  | "lease"
  | "shortlet"
  | "sold"
  | "rented"
  | "leased";

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

/**
 * What a PropertyCard renders, rather than any one source's model. The marketplace
 * maps a real listing into it and the still-mock seeker dashboard maps its own, so
 * one card serves both without the mock data having to mirror the API.
 */
export interface CardListing {
  /** React key only. What the card links to is href. */
  id: string;
  /** Where the card points: a slug for a real listing, an id while a page is mock. */
  href: string;
  title: string;
  /** May be "": a listing can go up before its photos do. */
  image: string;
  location: string;
  price: number;
  listingFor: ListingFor;
  status: VerificationStatus;
  /** Zero means "not applicable", never "unknown", so these render only when set. */
  beds: number;
  baths: number;
  areaSqm: number;
  hasVideo: boolean;
  realtor?: { name: string; avatar: string; certified: boolean };
}
