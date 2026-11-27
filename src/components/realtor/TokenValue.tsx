import { cn } from "@/lib/cn";
import { tokenValue, useTokenPrices } from "@/lib/wallet";

/**
 * What a token amount is worth today in naira and dollars, under the amount. Renders
 * nothing while the prices load or when the token has none: never a guessed figure.
 */
export function TokenValue({ amount, symbol, className }: { amount: string; symbol: string; className?: string }) {
  const { data: prices } = useTokenPrices();
  const value = tokenValue(amount, symbol, prices);

  if (!value) return null;

  return (
    <p className={cn("text-sm tabular-nums text-muted", className)} title="At today's price">
      {value}
    </p>
  );
}
