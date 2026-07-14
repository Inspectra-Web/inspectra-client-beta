import type { ListingFor, Property } from "@/types";

/** Prominent, capitalized label for a listing's intent, e.g. on a badge. */
export const LISTING_INTENT_LABEL: Record<ListingFor, string> = {
  sale: "For Sale",
  rent: "For Rent",
  lease: "For Lease",
  shortlet: "Shortlet",
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

/** True for any recurring let (everything except an outright sale). */
export const isRecurringLet = (f: ListingFor) => f !== "sale";

/* ------------------------------------------------------------------ *
 * Per-document verification checks, derived from a listing's submitted
 * documents + overall status. Shared by the realtor Verification queue
 * and the listing detail page so the two never drift.
 * ------------------------------------------------------------------ */

export type DocState = "verified" | "in-review" | "flagged" | "missing";
export interface DocCheck {
  label: string;
  state: DocState;
}

const REQUIRED_SALE = ["C of O", "Survey Plan", "Deed of Assignment"];
const REQUIRED_RENT = ["Tenancy Agreement", "Survey Plan"];

export function deriveDocChecks(p: Property): DocCheck[] {
  const submitted: DocCheck[] = p.documents.map((label, i) => {
    const last = i === p.documents.length - 1;
    if (p.status === "verified") return { label, state: "verified" };
    if (p.status === "disputed" && last) return { label, state: "flagged" };
    if (p.status === "pending" && last) return { label, state: "in-review" };
    return { label, state: "verified" };
  });

  if (p.status === "verified") return submitted;

  const required = isRecurringLet(p.listingFor) ? REQUIRED_RENT : REQUIRED_SALE;
  const missing = required
    .filter((d) => !p.documents.includes(d))
    .map<DocCheck>((label) => ({ label, state: "missing" }));

  return [...submitted, ...missing];
}
