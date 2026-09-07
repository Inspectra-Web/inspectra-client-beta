import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import updateLocale from "dayjs/plugin/updateLocale";

/** Compact Naira price, e.g. 480_000_000 -> "₦480M", 8_200_000 -> "₦8.2M". */
export function formatPrice(value: number): string {
  if (value >= 1_000_000_000) return `₦${trim(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `₦${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `₦${trim(value / 1_000)}K`;
  return `₦${value.toLocaleString()}`;
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Full Naira price with grouping, e.g. 480_000_000 -> "₦480,000,000". */
export function formatPriceFull(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

/** The API stores fullname lowercased, so title-case it for display: "ada obi" -> "Ada Obi". */
export function displayName(fullname: string): string {
  return fullname
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Avatar fallback when the user has no image: "ada obi" -> "AO". */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";

  return (first + last).toUpperCase();
}

// Do (the ordinal day) is not in core; updateLocale is how the month names change.
dayjs.extend(advancedFormat);
dayjs.extend(updateLocale);

// MMM abbreviates September to "Sep"; the house style is "Sept". This is the locale
// every dayjs call in the app reads, so set it once here.
dayjs.updateLocale("en", {
  monthsShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
});

/** An ISO date -> "10th Sept 2026". */
export function formatDate(iso: string): string {
  const date = dayjs(iso);

  return date.isValid() ? date.format("Do MMM YYYY") : "";
}
