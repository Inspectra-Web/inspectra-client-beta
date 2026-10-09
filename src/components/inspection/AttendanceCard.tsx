import { useState } from "react";
import { toast } from "react-toastify";
import { Check, UserX } from "lucide-react";

import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format";
import {
  slotPassed,
  useAnswerAttendance,
  type Attendance,
  type InspectionRecord,
  type Party,
} from "@/lib/inspections";

/**
 * After a paid viewing, one side's answer to whether it happened. Shown only while
 * the money is held or under review, and only once the slot has passed: before that
 * there is nothing to answer, and the API would refuse it.
 *
 * Saying the other side did not show is asked twice, because it can freeze or forfeit
 * money; saying it happened is not.
 */
export function AttendanceCard({
  inspection,
  side,
  other,
}: {
  inspection: InspectionRecord;
  side: Party;
  /** The other side's first name, for the copy. */
  other: string;
}) {
  const answer = useAnswerAttendance(side);
  const [confirmingNoShow, setConfirmingNoShow] = useState(false);

  const { escrow } = inspection;
  const mine = side === "seeker" ? escrow.seekerAnswer : escrow.realtorAnswer;

  if (escrow.status !== "held" && escrow.status !== "disputed") return null;
  if (!slotPassed(inspection.slot)) return null;

  const send = async (value: Attendance) => {
    try {
      const result = await answer.mutateAsync({ id: inspection.id, answer: value });
      toast.success(result.message ?? "Thanks for letting us know.");
      setConfirmingNoShow(false);
    } catch (err) {
      toast.error(apiMessage(err, "Could not save your answer."));
    }
  };

  return (
    <Panel title="Did the viewing happen?">
      {escrow.status === "disputed" ? (
        <p className="text-sm text-muted">
          Your accounts of this viewing differ, so the fee is on hold while INSPECTRA
          reviews it. You will hear the outcome within 5 business days.
        </p>
      ) : mine.answer ? (
        <p className="text-sm text-muted">
          You said{" "}
          <span className="font-medium text-ink">
            {mine.answer === "happened" ? "the viewing happened" : `${other} did not show up`}
          </span>
          {mine.at ? ` on ${formatDate(mine.at)} at ${formatTime(mine.at)}` : ""}.{" "}
          {mine.answer === "happened"
            ? side === "realtor"
              ? "Your fee is released once the buyer confirms, or automatically 48 hours after we ask them."
              : `The fee is paid to ${other}.`
            : `${other} has 48 hours to respond before this is settled.`}
        </p>
      ) : (
        <>
          {side === "seeker" && escrow.realtorAnswer.answer === "no_show" ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-ink">
              {other} reported that you didn&apos;t attend
              {escrow.realtorAnswer.at
                ? ` on ${formatDate(escrow.realtorAnswer.at)} at ${formatTime(escrow.realtorAnswer.at)}`
                : ""}
              . If you did, say so below within 48 hours of that, or the fee is not refunded.
            </p>
          ) : (
            <p className="text-sm text-muted">
              {side === "seeker"
                ? `Tell us whether your viewing with ${other} went ahead. If you don't answer, the fee is paid to them 48 hours after we ask.`
                : `Tell us whether ${other} came to the viewing. Your fee is released once it is confirmed.`}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="brand"
              size="sm"
              disabled={answer.isPending}
              onClick={() => void send("happened")}
            >
              <Check className="size-4" aria-hidden />
              Yes, it happened
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={answer.isPending}
              onClick={() => setConfirmingNoShow(true)}
            >
              <UserX className="size-4" aria-hidden />
              {other} didn&apos;t show up
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmingNoShow}
        onOpenChange={setConfirmingNoShow}
        title={`${other} didn't show up?`}
        description={
          side === "seeker"
            ? `INSPECTRA will hold the fee and review what happened. If ${other} did not show, you get everything back.`
            : `${other} gets 48 hours to respond. If they don't dispute it, the fee is not paid out to either of you.`
        }
        confirmLabel="Yes, report it"
        cancelLabel="Go back"
        destructive
        pending={answer.isPending}
        onConfirm={() => send("no_show")}
      />
    </Panel>
  );
}
