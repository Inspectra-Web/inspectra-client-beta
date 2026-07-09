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
