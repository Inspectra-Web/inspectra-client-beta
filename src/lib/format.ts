import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
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

const NIGERIA = "234";

/**
 * A number as wa.me needs it: digits only, in full international form. Numbers here are
 * Nigerian, so a leading 0 is the local trunk prefix and becomes the country code.
 * "0801 234 5678" and "+234 801 234 5678" both give "2348012345678".
 */
export function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith(NIGERIA)) return digits;
  if (digits.startsWith("0")) return NIGERIA + digits.slice(1);

  return digits;
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
dayjs.extend(relativeTime);
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

/** An ISO date -> "2 hours ago". A conversation reads in relative time: "10th Sept
 *  2026" on a message sent this morning tells the reader nothing they wanted. */
export function timeAgo(iso: string): string {
  const date = dayjs(iso);

  return date.isValid() ? date.fromNow() : "";
}
