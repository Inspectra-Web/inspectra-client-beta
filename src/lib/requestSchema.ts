import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/authSchemas";
import { formatPriceFull } from "@/lib/format";
import type { ContactMeans } from "@/lib/profile";
import type {
  RequestBody,
  RequestCategory,
  RequestCity,
  RequestIntent,
  RequestTimeline,
} from "@/lib/requests";

// Client-side rules for the property request form. Field names and enums mirror
// server/src/validators/request.validator.ts, and the form submits straight through.

const titleCase = (v: string) => v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, " ");

export const INTENT_OPTIONS: { value: RequestIntent; label: string; hint: string }[] = [
  { value: "rent", label: "Rent", hint: "A yearly let" },
  { value: "sale", label: "Buy", hint: "Own it outright" },
  { value: "lease", label: "Lease", hint: "A long-term lease" },
  { value: "shortlet", label: "Shortlet", hint: "Nights or weeks" },
];

export const CITY_OPTIONS: { value: RequestCity; label: string }[] = [
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja" },
  { value: "port-harcourt", label: "Port Harcourt" },
];

export const TIMELINE_OPTIONS: { value: RequestTimeline; label: string }[] = [
  { value: "now", label: "As soon as possible" },
  { value: "3-months", label: "Within 3 months" },
  { value: "6-months", label: "Within 6 months" },
  { value: "exploring", label: "Just exploring" },
];

export const CONTACT_OPTIONS: ContactMeans[] = ["WhatsApp", "Phone", "Email", "Phone & WhatsApp"];

/** What a budget is counted over, by intent: the same periods a listing's price uses. */
export const BUDGET_PERIOD: Record<RequestIntent, string> = {
  rent: "a year",
  lease: "a year",
  shortlet: "a night",
  sale: "in total",
};

export const intentLabel = (v: RequestIntent) => INTENT_OPTIONS.find((o) => o.value === v)!.label;
export const cityLabel = (v: RequestCity) => CITY_OPTIONS.find((o) => o.value === v)!.label;
export const timelineLabel = (v: RequestTimeline) => TIMELINE_OPTIONS.find((o) => o.value === v)!.label;

/** "₦1,500,000 to ₦3,000,000 a year", or "Up to ₦3,000,000 a year" with no floor. */
export function budgetText(r: Pick<RequestBody, "intent" | "budgetMin" | "budgetMax">): string {
  const range =
    r.budgetMin != null
      ? `${formatPriceFull(r.budgetMin)} to ${formatPriceFull(r.budgetMax)}`
      : `Up to ${formatPriceFull(r.budgetMax)}`;
  return `${range} ${BUDGET_PERIOD[r.intent]}`;
}

/** Mirrors PROPERTY_TYPES_BY_CATEGORY in server/src/types/property.type.ts. */
export const TYPES_BY_CATEGORY: Record<RequestCategory, string[]> = {
  residential: [
    "apartment", "flat", "self-contained", "studio", "duplex", "terrace", "townhouse",
    "maisonette", "bungalow", "detached", "semi-detached", "villa", "mansion", "penthouse",
    "condominium", "serviced-apartment", "single-family-home", "multi-family-home",
  ],
  commercial: ["office", "shop", "studio", "warehouse", "restaurant", "hotel", "resort", "serviced-apartment"],
  industrial: ["factory", "warehouse", "farm"],
  land: ["land"],
  agricultural: ["farm", "land"],
  hospitality: ["hotel", "resort", "restaurant"],
  "mixed-use": ["office", "shop", "apartment", "warehouse", "studio", "land", "serviced-apartment"],
  institutional: ["hospital", "school"],
  recreational: ["resort", "hotel", "campground"],
  other: ["other"],
};

export const CATEGORY_OPTIONS = (Object.keys(TYPES_BY_CATEGORY) as RequestCategory[]).map(
  (value) => ({ value, label: titleCase(value) }),
);

export const typeOptions = (category: RequestCategory) =>
  TYPES_BY_CATEGORY[category].map((value) => ({ value, label: titleCase(value) }));

export const typeLabel = (value: string) => titleCase(value);

/** Bedrooms only mean something for homes, so the form asks for them there alone. */
export const asksBedrooms = (category: RequestCategory) => category === "residential";

export const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5", "6"];

/** Areas people actually search by. A suggestion list only: anything typed is kept. */
export const AREA_SUGGESTIONS: Record<RequestCity, string[]> = {
  lagos: [
    "Lekki Phase 1", "Ikoyi", "Victoria Island", "Oniru", "Banana Island", "Ajah", "Sangotedo",
    "Chevron", "Ikota", "Yaba", "Surulere", "Ikeja GRA", "Maryland", "Gbagada", "Magodo",
    "Ogudu", "Ilupeju", "Ojodu", "Festac",
  ],
  abuja: [
    "Maitama", "Asokoro", "Wuse 2", "Garki", "Gwarinpa", "Jabi", "Utako", "Life Camp",
    "Katampe", "Guzape", "Jahi", "Lokogoma", "Apo", "Kubwa", "Lugbe",
  ],
  "port-harcourt": [
    "Old GRA", "GRA Phase 1", "GRA Phase 2", "Trans-Amadi", "Woji", "Rumuola", "Rumuibekwe",
    "Eliozu", "Peter Odili Road", "Ada George", "Rumuokoro", "Rumuigbo", "Elelenwo", "D-Line",
    "Choba",
  ],
};

export const AREAS_MAX = 5;
export const NOTES_MAX = 500;

/** "1,500,000" or "₦1.5m" typed loosely: digits are what count. */
export const amountOf = (value: string): number | undefined => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : undefined;
};

const amount = z.string().refine((v) => amountOf(v) !== undefined, "Set a budget");

const requestObject = z.object({
  intent: z.enum(["rent", "sale", "lease", "shortlet"], "Choose what you want to do"),
  category: z.enum(
    Object.keys(TYPES_BY_CATEGORY) as [RequestCategory, ...RequestCategory[]],
    "Choose a property category",
  ),
  /** "" is "any type". */
  type: z.string(),
  /** "" is "any number". */
  bedrooms: z.string(),
  city: z.enum(["lagos", "port-harcourt", "abuja"], "Choose a city"),
  areas: z.array(z.string()).max(AREAS_MAX, `Name at most ${AREAS_MAX} areas`),
  budgetMin: z.string(),
  budgetMax: amount,
  timeline: z.enum(["now", "3-months", "6-months", "exploring"], "Say when you need it"),
  notes: z.string().max(NOTES_MAX, `Keep it under ${NOTES_MAX} characters`),
  // Checked in the superRefine below, not here: a failed field refine stops the
  // superRefine running, and an unticked box would hide the budget check on step 3.
  consent: z.boolean(),

  // The account, asked for only when signed out.
  fullname: z.string(),
  email: z.string(),
  phone: z.string(),
  contactMeans: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type RequestValues = z.infer<typeof requestObject>;

const budgetOrder = (v: RequestValues, ctx: z.RefinementCtx) => {
  const min = amountOf(v.budgetMin);
  const max = amountOf(v.budgetMax);
  if (min !== undefined && max !== undefined && min > max)
    ctx.addIssue({ code: "custom", path: ["budgetMin"], message: "The minimum cannot be above the maximum" });
};

/** The account fields, checked with the sign-up rules, only for someone joining. */
const accountRules = (v: RequestValues, ctx: z.RefinementCtx) => {
  const check = (path: keyof RequestValues, schema: z.ZodType, value: unknown) => {
    const result = schema.safeParse(value);
    if (!result.success)
      ctx.addIssue({ code: "custom", path: [path], message: result.error.issues[0]?.message ?? "Required" });
  };

  check("fullname", z.string().trim().min(2, "Enter your full name"), v.fullname);
  check("email", emailSchema, v.email.trim());
  check("phone", z.string().trim().min(7, "Enter a valid phone number"), v.phone);
  check("contactMeans", z.enum(CONTACT_OPTIONS, "Choose how we should reach you"), v.contactMeans);
  check("password", passwordSchema, v.password);
  if (v.password !== v.confirmPassword)
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
};

/** join: signed out, account included. seeker: a new request. edit: an existing one,
 *  whose consent was given when it was filed. */
export type RequestFormMode = "join" | "seeker" | "edit";

export function makeRequestSchema(mode: RequestFormMode) {
  return requestObject.superRefine((v, ctx) => {
    budgetOrder(v, ctx);
    if (mode !== "edit" && !v.consent)
      ctx.addIssue({ code: "custom", path: ["consent"], message: "Agree to be contacted to continue" });
    if (mode === "join") accountRules(v, ctx);
  });
}

const grouped = (n?: number) => (n == null ? "" : n.toLocaleString("en-NG"));

/** A saved request back into the form, for an edit. */
export function requestToValues(r: RequestBody): RequestValues {
  return {
    ...emptyRequestValues,
    intent: r.intent,
    category: r.category,
    type: r.type ?? "",
    bedrooms: r.bedrooms != null ? String(r.bedrooms) : "",
    city: r.city,
    areas: r.areas,
    budgetMin: grouped(r.budgetMin),
    budgetMax: grouped(r.budgetMax),
    timeline: r.timeline,
    notes: r.notes,
    consent: true,
  };
}

const CATEGORY_NOUN: Record<RequestCategory, string> = {
  residential: "Home",
  commercial: "Commercial space",
  industrial: "Industrial property",
  land: "Land",
  agricultural: "Farmland",
  hospitality: "Hospitality property",
  "mixed-use": "Mixed-use property",
  institutional: "Institutional property",
  recreational: "Recreational property",
  other: "Property",
};

const INTENT_PHRASE: Record<RequestIntent, string> = {
  rent: "to rent",
  sale: "to buy",
  lease: "to lease",
  shortlet: "for a shortlet",
};

/** "Duplex to rent in Abuja", "Land to buy in Lagos": a request's name on a card. */
export function requestTitle(r: Pick<RequestBody, "intent" | "category" | "type" | "city">): string {
  const what = r.type ? typeLabel(r.type) : CATEGORY_NOUN[r.category];
  return `${what} ${INTENT_PHRASE[r.intent]} in ${cityLabel(r.city)}`;
}

export const emptyRequestValues: RequestValues = {
  intent: "rent",
  category: "residential",
  type: "",
  bedrooms: "",
  city: "lagos",
  areas: [],
  budgetMin: "",
  budgetMax: "",
  timeline: "now",
  notes: "",
  consent: false,
  fullname: "",
  email: "",
  phone: "",
  contactMeans: "WhatsApp",
  password: "",
  confirmPassword: "",
};

/** The request half of the form, shaped as the API takes it. */
export function valuesToRequestBody(v: RequestValues): RequestBody {
  return {
    intent: v.intent,
    category: v.category,
    type: v.type || undefined,
    city: v.city,
    areas: v.areas,
    budgetMin: amountOf(v.budgetMin),
    budgetMax: amountOf(v.budgetMax) ?? 0,
    bedrooms: asksBedrooms(v.category) && v.bedrooms ? Number(v.bedrooms) : undefined,
    timeline: v.timeline,
    notes: v.notes.trim(),
  };
}
