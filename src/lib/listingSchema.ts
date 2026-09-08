import { z } from "zod";
import type { DefaultValues } from "react-hook-form";
import type { RealtorListing } from "@/lib/properties";

// Client-side validation for the realtor add/edit listing form. Field names and enums
// mirror the API's own schema (server/src/validators/property.validator.ts), and the
// form submits straight through. Verification is system-owned and not edited here.

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
  "institutional", "recreational", "other",
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
  // media. `images` holds preview URLs: an https one is already on the server, a
  // blob: one is a file the composer still has to upload.
  images: z.array(z.string()).min(1, "Add at least one photo"),
  videos: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), "Enter a valid URL"),

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

/** Values the API can send but this form does not offer; they fall back to "other". */
const asOption = <T extends readonly string[]>(values: T, value: string) =>
  (values as readonly string[]).includes(value) ? (value as T[number]) : "other";

/** Seed the form from a stored listing when editing. */
export function listingToFormValues(l: RealtorListing): DefaultValues<ListingValues> {
  const f = l.features;
  const some = (n: number) => (n ? n : undefined);

  return {
    images: l.images,
    videos: l.videoUrl,
    title: l.title,
    type: asOption(PROPERTY_TYPE_VALUES, l.type),
    category: asOption(CATEGORY_VALUES, l.category),
    listingStatus: l.listingStatus,
    description: l.description,
    price: l.price,
    fullAddress: l.address.fullAddress,
    city: l.address.city,
    state: l.address.state,
    country: l.address.country,
    bedrooms: some(f.bedrooms),
    bathrooms: some(f.bathrooms),
    toilets: some(f.toilets),
    garage: some(f.garage),
    kitchen: some(f.kitchen),
    floors: some(f.floors),
    floorArea: some(f.floorArea),
    landSize: some(f.landSize),
    yearBuilt: some(f.yearBuilt),
    amenities: l.amenities,
    // `file` is the handle: a stored document keeps its URL, so the keep-list on
    // save can tell it from one the composer has just picked.
    documents: l.documents.map((d) => ({ name: d.name, file: d.fileUrl })),
    additionalFees: l.fees.additional,
    paymentTerms: l.fees.paymentTerms,
    refundPolicy: l.fees.refundPolicy,
  };
}

/** Form values to the JSON body the API takes. Files are uploaded separately. */
export function formValuesToBody(v: ListingValues) {
  return {
    title: v.title,
    description: v.description,
    price: v.price,
    type: v.type,
    category: v.category,
    listingStatus: v.listingStatus,
    address: {
      fullAddress: v.fullAddress,
      city: v.city,
      state: v.state,
      country: v.country,
    },
    features: {
      bedrooms: v.bedrooms ?? 0,
      bathrooms: v.bathrooms ?? 0,
      toilets: v.toilets ?? 0,
      garage: v.garage ?? 0,
      kitchen: v.kitchen ?? 0,
      floors: v.floors ?? 0,
      floorArea: v.floorArea ?? 0,
      landSize: v.landSize ?? 0,
      yearBuilt: v.yearBuilt ?? 0,
    },
    amenities: v.amenities,
    videoUrl: v.videos ?? "",
    fees: {
      paymentTerms: v.paymentTerms ?? "",
      refundPolicy: v.refundPolicy ?? "",
      additional: v.additionalFees,
    },
  };
}
