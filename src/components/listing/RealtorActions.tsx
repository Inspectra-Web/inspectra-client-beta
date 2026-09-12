import { Link, useLocation } from "react-router";
import { ArrowRight, CalendarCheck, MessageCircle } from "lucide-react";

import { InspectionForm } from "@/components/inspection/InspectionForm";
import { InquiryForm } from "@/components/listing/InquiryForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { buttonClasses } from "@/components/ui/Button";
import { useMe } from "@/lib/auth";
import { cn } from "@/lib/cn";

/**
 * The two things a buyer can do from a listing: book a viewing, or message the
 * realtor. Both open as dialogs, so the aside card stays a price-and-trust summary
 * instead of carrying a form inline.
 *
 * Public page, so the session may be missing: useMe is nullable, unlike useAuthUser,
 * which throws outside a guarded route. The gate lives here once rather than inside
 * each form, which also means a realtor sees one honest sentence instead of the same
 * refusal written twice.
 */
export function RealtorActions({
  propertyId,
  first,
}: {
  propertyId: string;
  first: string;
}) {
  const { pathname } = useLocation();
  const { data: user, isPending } = useMe();

  // Nothing is offered on a guess: the card waits for the session to resolve.
  if (isPending)
    return (
      <div className="mt-5 space-y-2">
        <div className="h-12 animate-pulse rounded-full bg-surface-2/60" />
        <div className="h-12 animate-pulse rounded-full bg-surface-2/60" />
      </div>
    );

  // One click to the place where both actions become possible, rather than a button
  // that opens a dialog only to say the same thing.
  if (!user)
    return (
      <div className="mt-5 rounded-2xl border border-line bg-surface-2/40 p-4 text-sm">
        <p className="font-semibold text-ink">Book a viewing or ask a question</p>
        <p className="mt-1 text-muted">
          Sign in to arrange an inspection or message {first}. No fee to book, and
          every message stays on INSPECTRA.
        </p>
        <Link
          to="/login"
          state={{ from: pathname }}
          className={cn(buttonClasses("brand", "md"), "mt-3 w-full")}
        >
          Sign in <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  // A realtor or an admin gets no form. Both actions belong to a buyer, and the API
  // refuses either from any other role, so offering them would be a lie.
  if (user.role !== "seeker")
    return (
      <div className="mt-5 rounded-2xl border border-line bg-surface-2/40 p-4 text-sm">
        <p className="font-semibold text-ink">You are signed in as a {user.role}</p>
        <p className="mt-1 text-muted">
          Viewings and inquiries come from buyer accounts, so there is nothing to send
          from here.
        </p>
      </div>
    );

  return (
    <div className="mt-5 space-y-2">
      <Dialog>
        <DialogTrigger className={cn(buttonClasses("brand", "lg"), "w-full")}>
          <CalendarCheck className="size-4" aria-hidden />
          Book an inspection
        </DialogTrigger>
        <DialogContent closeLabel="Close booking form">
          <DialogTitle>Book an inspection</DialogTitle>
          <DialogDescription>
            Pick a time that works for you. {first} confirms it, and nothing is charged
            to book.
          </DialogDescription>
          <InspectionForm propertyId={propertyId} first={first} />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger className={cn(buttonClasses("outline", "lg"), "w-full")}>
          <MessageCircle className="size-4" aria-hidden />
          Message {first}
        </DialogTrigger>
        <DialogContent closeLabel="Close message form">
          <DialogTitle>Message {first}</DialogTitle>
          <DialogDescription>
            Ask about the documents, the fees or a viewing. Their reply lands in your
            inquiries.
          </DialogDescription>
          <InquiryForm propertyId={propertyId} first={first} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
