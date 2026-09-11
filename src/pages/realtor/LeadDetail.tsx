import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowLeft, Check, Inbox, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { Thread, MessageComposer } from "@/components/dashboard/Thread";
import { BuyerSummary } from "@/components/realtor/BuyerSummary";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { displayName } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import { useLead, useSendLeadMessage, useUpdateLeadStatus } from "@/lib/inquiries";

export function RealtorLeadDetail() {
  const user = useAuthUser();
  const { id } = useParams();

  const { data, isPending, isError, error } = useLead(id ?? "");
  const send = useSendLeadMessage();
  const setStatus = useUpdateLeadStatus();

  if (isPending) return <DetailSkeleton />;

  if (isError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Inbox className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Lead not found</h1>
        <p className="mt-2 max-w-sm text-muted">
          {apiMessage(error, "This conversation may have been removed.")}
        </p>
        <Link to="/realtor/leads" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to leads
        </Link>
      </div>
    );

  const { inquiry, property, seeker } = data;
  const name = displayName(seeker.fullname);
  const first = name.split(" ")[0] ?? "the buyer";
  const closed = inquiry.status === "closed";

  // Rethrown so the composer keeps what was typed when a send fails.
  const onSend = async (message: string) => {
    try {
      const result = await send.mutateAsync({ id: inquiry.id, message });
      toast.success(result.message ?? "Message sent.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not send your reply."));
      throw err;
    }
  };

  const toggle = async () => {
    try {
      const result = await setStatus.mutateAsync({
        id: inquiry.id,
        status: closed ? "open" : "closed",
      });
      toast.success(result.message ?? "Conversation updated.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not update this conversation."));
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/realtor/leads"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to leads
      </Link>

      <Reveal>
        <PageHeader
          title={name}
          subtitle={`Inquiry on ${property.title}`}
          actions={
            <div className="flex items-center gap-3">
              <StatusPill status={inquiry.status} />
              <Button
                variant="outline"
                size="sm"
                disabled={setStatus.isPending}
                onClick={toggle}
              >
                {closed ? (
                  <>
                    <RotateCcw className="size-4" aria-hidden />
                    Reopen
                  </>
                ) : (
                  <>
                    <Check className="size-4" aria-hidden />
                    Close
                  </>
                )}
              </Button>
            </div>
          }
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        {/* conversation */}
        <Reveal y={16}>
          <Panel title="Conversation">
            <Thread
              messages={inquiry.messages}
              mine="realtor"
              me={{ name: displayName(user.fullname), avatar: user.avatar }}
              them={{ name, avatar: seeker.avatar }}
            />

            {closed && (
              <p className="mt-5 rounded-xl bg-surface-2/60 px-4 py-3 text-center text-sm text-muted">
                You closed this conversation. Replying reopens it.
              </p>
            )}

            <MessageComposer
              placeholder={`Reply to ${first}…`}
              label="Send reply"
              pending={send.isPending}
              onSend={onSend}
            />
          </Panel>
        </Reveal>

        {/* aside */}
        <Reveal y={16} className="space-y-4">
          <BuyerSummary name={name} avatar={seeker.avatar} />
          <PropertySummary
            image={property.image}
            title={property.title}
            location={listingAddress(property)}
            price={property.price}
            listingFor={property.listingStatus}
            status={property.status}
            // Their own listing, so it stays in the console: the public page is the
            // buyer's view. Addressed by id here, the way the listings table links.
            href={`/realtor/listings/${property.id}`}
          />
        </Reveal>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
      <div className="space-y-2.5">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-72 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="h-80 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
