import { z } from "zod";
import type { DefaultValues } from "react-hook-form";
import { properties } from "@/data/mock";
import type { Property } from "@/types";

// Client-side validation for the realtor add/edit listing form (mock, Phase 6: no backend).
// Field names and enums mirror the real Inspectra backend Property model (inspectra-server) so the
// beta lines up with production. Verification (reviewStatus) is system-owned and not edited here.

const titleCase = (v: string) => v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, " ");
const asOptions = <T extends readonly string[]>(values: T) =>
  values.map((value) => ({ value, label: titleCase(value) }));

/** Property types (mirrors the backend `type` enum). */
export const PROPERTY_TYPE_VALUES = [
  "office", "warehouse", "land", "apartment", "condominium", "duplex", "townhouse", "villa",
  "bungalow", "single-family-home", "multi-family-home", "studio", "penthouse", "hotel", "resort",
  "restaurant", "serviced-apartment", "hospital", "school", "farm", "campground", "mansion",
  "maisonette", "self-contained", "flat", "other",
] as const;
export const PROPERTY_TYPE_OPTIONS = asOptions(PROPERTY_TYPE_VALUES);

/** Property category (mirrors the backend `category` enum). */
export const CATEGORY_VALUES = [
  "residential", "commercial", "industrial", "land", "agricultural", "hospitality", "mixed-use",
  "institutional", "recreational",
] as const;
export const CATEGORY_OPTIONS = asOptions(CATEGORY_VALUES);

/** Listing status (mirrors the backend `listingStatus` enum; also carries terminal states). */
export const LISTING_STATUS_VALUES = [
  "rent", "sale", "lease", "shortlet", "sold", "rented", "leased",
] as const;
export const LISTING_STATUS_OPTIONS: { value: (typeof LISTING_STATUS_VALUES)[number]; label: string }[] = [
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
  { value: "lease", label: "For lease" },
  { value: "shortlet", label: "Shortlet" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "leased", label: "Leased" },
];

/** Cities on the platform, derived from the marketplace data so the two never drift. */
export const CITIES = Array.from(new Set(properties.map((p) => p.city)));

/** Legal document types (mirrors the backend `legalDocuments.name` enum). */
export const DOC_TYPES = [
  "Certificate of Occupancy (C of O)",
  "Governor's Consent",
  "Deed of Assignment",
  "Deed of Conveyance",
  "Deed of Lease / Sublease",
  "Power of Attorney",
  "Land Purchase Receipt",
  "Registered Survey Plan",
  "Excision / Gazette",
  "Building Plan Approval",
  "Environmental Impact Assessment (EIA)",
  "Completion Certificate",
  "Certificate of Habitability",
  "Property Tax Clearance Certificate",
  "Valuation Report",
  "Tenancy Agreement",
  "Lease Agreement",
  "Inspection Report",
  "Estate Allocation Letter",
  "Agency Agreement",
  "Government Allocation Letter",
  "Affidavit of Ownership",
  "Offer Letter / Acceptance Letter",
  "Other",
];

/** Amenity checkboxes (backend `amenities` is free-form; this is a curated UI list). */
export const AMENITIES = [
  "Water Treatment Plant",
  "Electricity Supply",
  "Backup Generator",
  "Air Conditioning",
  "High-speed Internet",
  "24/7 Security",
  "Swimming Pool",
  "Gym",
  "Concierge Service",
  "Elevator",
  "Fully Equipped Kitchen",
  "Smart Home Features",
  "Dishwasher",
  "Washer / Dryer",
  "Balcony",
  "Pet-friendly",
  "Gated Community",
  "Video Doorbell",
  "CCTV System",
  "Overhead Water Tank",
  "Prepaid Meter",
  "Borehole",
  "Solar Inverter",
  "Interlocked Compound",
  "Furnished",
  "Fitted Wardrobes",
  "POP Ceilings",
  "Walk-in Closet",
  "All Rooms En-suite",
  "Tiled Floors",
  "Ample Parking Space",
  "Good Road Network",
  "Serviced Estate",
  "Boys' Quarters",
  "Water Heater",
  "Well Ventilated",
];

/** Coerce a form value to a number, treating blanks and junk as absent. */
const toNumber = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const optionalCount = z.preprocess(
  toNumber,
  z.number().int("Enter a whole number").nonnegative("Cannot be negative").optional(),
);
const optionalArea = z.preprocess(toNumber, z.number().positive("Enter a valid size").optional());

const listingObject = z.object({
  // media
  images: z.array(z.string()).min(1, "Add at least one photo"),
  videos: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), "Enter a valid URL"),
  videoFile: z.string().optional(),

  // core
  title: z.string().trim().min(4, "Give the listing a descriptive title"),
  type: z.enum(PROPERTY_TYPE_VALUES, { error: "Choose a property type" }),
  category: z.enum(CATEGORY_VALUES, { error: "Choose a category" }),
  listingStatus: z.enum(LISTING_STATUS_VALUES, { error: "Choose a listing status" }),
  description: z.string().trim().min(10, "Add a short description").max(1200, "Keep it under 1200 characters"),
  price: z.preprocess(
    toNumber,
    z.number({ error: "Enter the asking price" }).positive("Price must be greater than 0"),
  ),

  // address (mirrors backend `address` sub-doc)
  fullAddress: z.string().trim().min(4, "Enter the full address"),
  city: z.string().trim().min(2, "Enter the city or LGA"),
  state: z.string().trim().min(2, "Enter the state"),
  country: z.string().trim().min(2, "Enter the country"),

  // features (mirrors backend `features` sub-doc)
  bedrooms: optionalCount,
  bathrooms: optionalCount,
  toilets: optionalCount,
  garage: optionalCount,
  kitchen: optionalCount,
  floors: optionalCount,
  floorArea: optionalArea,
  landSize: optionalArea,
  yearBuilt: z.preprocess(
    toNumber,
    z.number().int().min(1900, "Enter a valid year").max(2100, "Enter a valid year").optional(),
  ),

  amenities: z.array(z.string()),
  // each document is a typed entry (name from DOC_TYPES) plus its uploaded file
  documents: z.array(z.object({ name: z.string().min(1), file: z.string() })),

  // pricing & fees (mirrors backend `transparentFeesAndTerms`)
  additionalFees: z.array(
    z.object({
      name: z.string().trim().min(1),
      amount: z.number().nonnegative(),
      optional: z.boolean(),
    }),
  ),
  paymentTerms: z.string().trim().max(300, "Keep it under 300 characters").optional(),
  refundPolicy: z.string().trim().max(300, "Keep it under 300 characters").optional(),
});

export type ListingValues = z.infer<typeof listingObject>;

/** Mode-aware schema (kept as a factory for future new/edit differences). */
export function makeListingSchema(_mode: "new" | "edit") {
  return listingObject;
}

/** Blank defaults for a new listing. */
export const emptyListingValues: DefaultValues<ListingValues> = {
  images: [],
  videos: "",
  videoFile: "",
  title: "",
  type: "apartment",
  category: "residential",
  listingStatus: "sale",
  description: "",
  price: undefined,
  fullAddress: "",
  city: "",
  state: "",
  country: "Nigeria",
  bedrooms: undefined,
  bathrooms: undefined,
  toilets: undefined,
  garage: undefined,
  kitchen: undefined,
  floors: undefined,
  floorArea: undefined,
  landSize: undefined,
  yearBuilt: undefined,
  amenities: [],
  documents: [],
  additionalFees: [],
  paymentTerms: "",
  refundPolicy: "",
};

/** Normalize a beta Property type (Title-case) to a backend enum value. */
const toTypeValue = (t: string): (typeof PROPERTY_TYPE_VALUES)[number] => {
  const lower = t.toLowerCase();
  return (PROPERTY_TYPE_VALUES as readonly string[]).includes(lower)
    ? (lower as (typeof PROPERTY_TYPE_VALUES)[number])
    : "other";
};

/** Seed the form from an existing property when editing (only mapped fields carry over). */
export function propertyToFormValues(p: Property): DefaultValues<ListingValues> {
  return {
    ...emptyListingValues,
    images: [p.image],
    title: p.title,
    type: toTypeValue(p.type),
    listingStatus: p.listingFor,
    price: p.price,
    fullAddress: p.location,
    city: p.city,
    bedrooms: p.beds,
    bathrooms: p.baths,
    floorArea: p.areaSqm,
    documents: p.documents.map((name) => ({ name, file: "" })),
  };
}
