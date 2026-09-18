import { Link, useSearchParams } from "react-router";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useVerifyPayment } from "@/lib/subscription";
import { apiMessage } from "@/lib/api";
import { formatDate, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Where Flutterwave sends the realtor back to.
 *
 * It lands inside the realtor console rather than on a bare page, so the sidebar is
 * still there and a failed payment is one click from trying again. The API is asked to
 * confirm the transaction rather than the URL being believed: `status=successful` in a
 * query string is a claim by the browser, and the amount lives nowhere near it.
 */
export function RealtorSubscriptionCallback() {
  const [params] = useSearchParams();

  const reference = params.get("tx_ref") ?? "";
  const transactionId = params.get("transaction_id") ?? "";
  // Flutterwave says "cancelled" when someone backs out of the hosted page.
  const declared = params.get("status") ?? "";

  const abandoned = declared === "cancelled" || (!transactionId && declared !== "successful");

  const verify = useVerifyPayment(abandoned ? "" : reference, transactionId);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Payment"
          subtitle="Confirming what Flutterwave sent back."
        />
      </Reveal>

      <Reveal y={16}>
        <Panel>
          <div className="py-6 text-center">
            {abandoned ? (
              <Outcome
                tone="warn"
                icon={<TriangleAlert className="size-7" aria-hidden />}
                title="Payment not completed"
                body="Nothing was charged. Your plan is exactly as it was, and you can pick it up again whenever you like."
              />
            ) : verify.isPending ? (
              <Outcome
                tone="brand"
                icon={<Loader2 className="size-7 animate-spin" aria-hidden />}
                title="Confirming your payment"
                body="This only takes a second. Do not close this tab."
              />
            ) : verify.isError ? (
              <Outcome
                tone="danger"
                icon={<TriangleAlert className="size-7" aria-hidden />}
                title="We could not confirm that payment"
                body={apiMessage(
                  verify.error,
                  "Something went wrong confirming your payment.",
                )}
                note={reference ? `Reference ${reference}` : undefined}
              />
            ) : (
              <Outcome
                tone="verified"
                icon={<CircleCheck className="size-7" aria-hidden />}
                title={`You are on ${verify.data.plan.name}`}
                body={`${formatPriceFull(verify.data.payment.amount)} received. Your plan runs until ${
                  verify.data.subscription.currentPeriodEnd
                    ? formatDate(verify.data.subscription.currentPeriodEnd)
                    : "the end of the period"
                }, and you can now publish up to ${verify.data.allowance.limit} listings.`}
                note={`Reference ${verify.data.payment.reference}`}
              />
            )}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/realtor/subscription"
                className={buttonClasses(
                  verify.isSuccess ? "outline" : "brand",
                  "md",
                )}
              >
                {verify.isSuccess ? "Back to subscription" : "Try again"}
              </Link>
              {verify.isSuccess && (
                <Link to="/realtor/listings" className={buttonClasses("brand", "md")}>
                  Go to my listings
                </Link>
              )}
              {verify.isError && (
                <Button variant="outline" onClick={() => void verify.refetch()}>
                  Check again
                </Button>
              )}
            </div>
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const TONES = {
  brand: "bg-brand/10 text-brand-ink",
  verified: "bg-verified/12 text-verified",
  warn: "bg-gold/12 text-gold",
  danger: "bg-rose-500/12 text-rose-500",
};

function Outcome({
  tone,
  icon,
  title,
  body,
  note,
}: {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  title: string;
  body: string;
  note?: string;
}) {
  return (
    <>
      <span className={cn("inline-grid size-14 place-items-center rounded-2xl", TONES[tone])}>
        {icon}
      </span>
      <h2 className="display mt-5 text-3xl text-ink max-sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      {note && (
        <p className="mt-2 text-xs uppercase tracking-wide text-faint">{note}</p>
      )}
    </>
  );
}
