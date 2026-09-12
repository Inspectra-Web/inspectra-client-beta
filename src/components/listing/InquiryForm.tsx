import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { ArrowRight, Check } from "lucide-react";

import { DialogClose } from "@/components/ui/Dialog";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useCreateInquiry } from "@/lib/inquiries";
import { cn } from "@/lib/cn";

/**
 * The message form itself, with no session gating of its own: RealtorActions decides
 * whether anyone may see it, so this renders only for a signed-in buyer. It mirrors
 * InspectionForm, including keeping its own success state, so the two dialogs in the
 * aside behave identically.
 */
export function InquiryForm({
  propertyId,
  first,
}: {
  propertyId: string;
  first: string;
}) {
  const create = useCreateInquiry();

  const [message, setMessage] = useState("");
  const [sent, setSent] = useState("");

  if (sent)
    return (
      <div className="mt-5 rounded-2xl border border-verified/30 bg-verified/5 p-4 text-sm">
        <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <Check className="size-4 text-verified" aria-hidden /> Message sent
        </p>
        <p className="mt-1 text-muted">
          {first} has been emailed. Their reply lands in your inquiries.
        </p>
        <Link
          to={`/dashboard/inquiries/${sent}`}
          className={cn(buttonClasses("brand", "md"), "mt-3 w-full")}
        >
          Open the conversation <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );

  const send = async () => {
    const body = message.trim();

    if (!body || create.isPending) return;

    try {
      const result = await create.mutateAsync({ property: propertyId, message: body });
      toast.success(result.message ?? "Your inquiry is with the realtor.");
      setSent(result.inquiry.id);
    } catch (error) {
      toast.error(apiMessage(error, "Could not send your message."));
    }
  };

  return (
    <div className="mt-5">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        autoFocus
        placeholder="Ask about the documents, the fees or a viewing…"
        aria-label={`Message ${first} about this listing`}
        className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      />

      <div className="mt-5 flex justify-end gap-2 max-sm:flex-col-reverse">
        <DialogClose asChild>
          <button type="button" className={buttonClasses("outline", "md")}>
            Cancel
          </button>
        </DialogClose>
        <button
          type="button"
          onClick={send}
          disabled={!message.trim() || create.isPending}
          className={cn(buttonClasses("brand", "md"), "disabled:opacity-50")}
        >
          {create.isPending ? "Sending…" : "Send message"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
