import { documentPath, type DocumentStatus, type ListingDocument } from "./properties";
import type { ListingFor } from "@/types";

/** Prominent, capitalized label for a listing's intent, e.g. on a badge. */
export const LISTING_INTENT_LABEL: Record<ListingFor, string> = {
  sale: "For Sale",
  rent: "For Rent",
  lease: "For Lease",
  shortlet: "Shortlet",
  sold: "Sold",
  rented: "Rented",
  leased: "Leased",
};

/** Price suffix, e.g. ₦22M/yr, ₦165K/night. Sale prices carry none. */
export function priceSuffix(f: ListingFor): string {
  if (f === "rent" || f === "lease") return "/yr";
  if (f === "shortlet") return "/night";
  return "";
}

/** Caption under a big price on the listing hero. */
export function priceCadence(f: ListingFor): string {
  if (f === "rent" || f === "lease") return "per year";
  if (f === "shortlet") return "per night";
  return "for sale";
}

/** True for any recurring let. Named, not negated, so a retired listing is not one. */
export const isRecurringLet = (f: ListingFor) =>
  f === "rent" || f === "lease" || f === "shortlet";

/* ------------------------------------------------------------------ *
 * Per-document verification checks: the API's per-document status in the
 * checklist's own vocabulary. Every surface that renders a dossier reads
 * this one shape, so the realtor's listing page, their verification page
 * and the admin console cannot drift.
 * ------------------------------------------------------------------ */

export type DocState = "verified" | "in-review" | "flagged";

export interface DocCheck {
  /** The document's own id: two documents may legitimately share a name. */
  id: string;
  label: string;
  state: DocState;
  /** The API route that streams the file. Not a Cloudinary link: there is none to give. */
  path: string;
  /** Why the reviewer flagged it. Empty unless flagged. */
  reason: string;
}

export const toDocCheck = (listingId: string) => (doc: ListingDocument): DocCheck => ({
  id: doc.id,
  label: doc.name,
  state: doc.status === "pending" ? "in-review" : doc.status,
  path: documentPath(listingId, doc.id),
  reason: doc.reason,
});

/**
 * The same vocabulary for a visitor. The public payload carries the fact of a check
 * and nothing else: no document id, no reviewer's reason, and no file to open, since
 * a title document is streamed to its owner and an admin only.
 */
export interface PublicDocCheck {
  label: string;
  state: DocState;
}

export const toPublicDocCheck = (doc: {
  name: string;
  status: DocumentStatus;
}): PublicDocCheck => ({
  label: doc.name,
  state: doc.status === "pending" ? "in-review" : doc.status,
});
