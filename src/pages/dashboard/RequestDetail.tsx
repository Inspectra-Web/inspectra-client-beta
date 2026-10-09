import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowLeft, ClipboardList, Loader2, Pencil, Plus, RotateCcw, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { RequestSummary } from "@/components/request/RequestSummary";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  requestState,
  useCloseRequest,
  useMyRequest,
  useRenewRequest,
} from "@/lib/requests";
import { requestTitle } from "@/lib/requestSchema";
import { cn } from "@/lib/cn";

export function RequestDetail() {
  const { id = "" } = useParams();
  const { data: request, isPending, isError, error } = useMyRequest(id);
  const renew = useRenewRequest();
  const close = useCloseRequest();
  const [confirming, setConfirming] = useState(false);

  if (isPending) return <DetailSkeleton />;

  if (isError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <ClipboardList className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Request not found</h1>
        <p className="mt-2 max-w-sm text-muted">{apiMessage(error, "This request may have been removed.")}</p>
        <Link to="/dashboard/requests" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to requests
        </Link>
      </div>
    );

  const state = requestState(request);

  async function onRenew() {
    try {
      await renew.mutateAsync(request!.id);
      toast.success("Renewed for another 90 days.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not renew this request."));
    }
  }

  async function onClose() {
    try {
      await close.mutateAsync(request!.id);
      toast.success("Request closed.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not close this request."));
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/requests"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to requests
      </Link>

      <Reveal>
        <PageHeader
          title={requestTitle(request)}
          subtitle={`Filed ${formatDate(request.createdAt)}`}
          actions={<StatusPill status={state} />}
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="min-w-0">
          <Panel title="What you asked for">
            <RequestSummary request={request} />
          </Panel>
        </Reveal>

        <Reveal y={16}>
          <Panel title="Status">
            <p className="text-sm leading-relaxed text-muted">
              {state === "active" && (
                <>
                  Active until <span className="font-medium text-ink">{formatDate(request.expiresAt)}</span>. We'll
                  let you know when verified homes that match go live, and check in before it lapses.
                </>
              )}
              {state === "expired" && (
                <>
                  Expired on <span className="font-medium text-ink">{formatDate(request.expiresAt)}</span>. Renew it
                  to keep hearing about homes that match.
                </>
              )}
              {state === "closed" && (
                <>
                  Closed on <span className="font-medium text-ink">{formatDate(request.updatedAt)}</span>. If you
                  start looking again, file a new request.
                </>
              )}
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              {state === "expired" && (
                <button type="button" onClick={onRenew} disabled={renew.isPending} className={buttonClasses("brand", "md")}>
                  {renew.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
                  Renew for 90 days
                </button>
              )}

              {state !== "closed" && (
                <>
                  <Link to={`/dashboard/requests/${request.id}/edit`} className={buttonClasses(state === "active" ? "brand" : "outline", "md")}>
                    <Pencil className="size-4" aria-hidden />
                    Edit request
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className={cn(buttonClasses("ghost", "md"), "hover:text-rose-600 dark:hover:text-rose-400")}
                  >
                    <XCircle className="size-4" aria-hidden />
                    Close request
                  </button>
                </>
              )}

              {state === "closed" && (
                <Link to="/request" className={buttonClasses("outline", "md")}>
                  <Plus className="size-4" aria-hidden />
                  New request
                </Link>
              )}
            </div>
          </Panel>
        </Reveal>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Close this request?"
        description="You'll stop hearing about homes that match it. A closed request can't be reopened, but you can file a new one any time."
        confirmLabel="Close request"
        cancelLabel="Keep it"
        destructive
        pending={close.isPending}
        onConfirm={onClose}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="h-9 w-80 animate-pulse rounded bg-surface-2" />
      <div className="grid grid-cols-[1fr_20rem] gap-6 max-lg:grid-cols-1">
        <div className="h-80 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-48 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
