import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { ArrowRight, Check } from "lucide-react";

import { SlotPicker } from "@/components/inspection/SlotPicker";
import { DialogClose } from "@/components/ui/Dialog";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useBookInspection, toSlot } from "@/lib/inspections";
import { cn } from "@/lib/cn";

const NOTE_MAX = 500;

/**
 * The booking form itself, with no session gating of its own: RealtorActions decides
 * whether anyone may see it, so this renders only for a signed-in buyer. It keeps its
 * own success state rather than closing on submit, because the confirmation is the
 * one place the new booking's link is offered.
 */
export function InspectionForm({
  propertyId,
  first,
}: {
  propertyId: string;
  first: string;
}) {
  const book = useBookInspection();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [booked, setBooked] = useState("");

  if (booked)
    return (
      <div className="mt-5 rounded-2xl border border-verified/30 bg-verified/5 p-4 text-sm">
        <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <Check className="size-4 text-verified" aria-hidden /> Viewing requested
        </p>
        <p className="mt-1 text-muted">
          {first} has been emailed. You will see it confirmed in your inspections.
        </p>
        <Link
          to={`/dashboard/inspections/${booked}`}
          className={cn(buttonClasses("brand", "md"), "mt-3 w-full")}
        >
          Open the booking <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  const submit = async () => {
    const slot = toSlot(date, time);

    if (!slot) {
      toast.error("Pick a date and a time.");
      return;
    }

    try {
      const result = await book.mutateAsync({
        property: propertyId,
        slot,
        ...(note.trim() ? { note: note.trim() } : {}),
      });

      toast.success(result.message ?? "Your viewing request is with the realtor.");
      setBooked(result.inspection.id);
    } catch (error) {
      // A 409 means this buyer already has a live booking here, and the API writes
      // the sentence that says so, which is why nothing is invented on this end.
      toast.error(apiMessage(error, "Could not book this viewing."));
    }
  };

  return (
    <div className="mt-5">
      <SlotPicker
        date={date}
        time={time}
        onDate={setDate}
        onTime={setTime}
        disabled={book.isPending}
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={NOTE_MAX}
        placeholder="Anything the realtor should know (optional)"
        aria-label="Note for the realtor"
        className="mt-4 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      />

      <div className="mt-5 flex justify-end gap-2 max-sm:flex-col-reverse">
        <DialogClose asChild>
          <button type="button" className={buttonClasses("outline", "md")}>
            Cancel
          </button>
        </DialogClose>
        <button
          type="button"
          onClick={submit}
          disabled={!date || !time || book.isPending}
          className={cn(buttonClasses("brand", "md"), "disabled:opacity-50")}
        >
          {book.isPending ? "Requesting…" : "Request this viewing"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
