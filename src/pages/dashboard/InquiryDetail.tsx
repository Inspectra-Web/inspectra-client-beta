import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { RealtorSummary } from "@/components/dashboard/RealtorSummary";
import { Thread, MessageComposer } from "@/components/dashboard/Thread";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { displayName } from "@/lib/format";
import { listingAddress } from "@/lib/marketplace";
import { useMyInquiry, useSendInquiryMessage } from "@/lib/inquiries";

export function InquiryDetail() {
  const user = useAuthUser();
  const { id } = useParams();

  const { data, isPending, isError, error } = useMyInquiry(id ?? "");
  const send = useSendInquiryMessage();

  if (isPending) return <DetailSkeleton />;

  if (isError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <MessageSquare className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Inquiry not found</h1>
        <p className="mt-2 max-w-sm text-muted">
          {apiMessage(error, "This conversation may have been removed.")}
        </p>
        <Link to="/dashboard/inquiries" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to inquiries
        </Link>
      </div>
    );

  const { inquiry, property, realtor } = data;
  const name = displayName(realtor.fullname);
  const first = name.split(" ")[0] ?? "the realtor";

  // Rethrown so the composer keeps what was typed when a send fails.
  const onSend = async (message: string) => {
    try {
      const result = await send.mutateAsync({ id: inquiry.id, message });
      toast.success(result.message ?? "Message sent.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not send your message."));
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/inquiries"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to inquiries
      </Link>

      <Reveal>
        <PageHeader
          title={property.title}
          subtitle={listingAddress(property)}
          actions={<StatusPill status={inquiry.status} />}
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        {/* conversation */}
        <Reveal y={16}>
          <Panel title="Conversation">
            <Thread
              messages={inquiry.messages}
              mine="seeker"
              me={{ name: displayName(user.fullname), avatar: user.avatar }}
              them={{ name, avatar: realtor.avatar }}
            />

            {inquiry.status === "new" && (
              <p className="mt-5 rounded-xl bg-surface-2/60 px-4 py-3 text-center text-sm text-muted">
                Waiting for {first} to reply. We'll email you as soon as they do.
              </p>
            )}

            {inquiry.status === "closed" && (
              <p className="mt-5 rounded-xl bg-surface-2/60 px-4 py-3 text-center text-sm text-muted">
                {first} has closed this conversation. Writing again reopens it.
              </p>
            )}

            <MessageComposer
              placeholder={`Write to ${first}…`}
              label="Send message"
              pending={send.isPending}
              onSend={onSend}
            />
          </Panel>
        </Reveal>

        {/* aside */}
        <Reveal y={16} className="space-y-4">
          <PropertySummary
            image={property.image}
            title={property.title}
            location={listingAddress(property)}
            price={property.price}
            listingFor={property.listingStatus}
            status={property.status}
            href={`/listings/${property.slug}`}
          />
          <RealtorSummary
            name={name}
            avatar={realtor.avatar}
            agency={realtor.agencyName}
            city={realtor.city}
            certified={realtor.certified}
            href={`/realtors/${realtor.id}`}
          />
        </Reveal>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="space-y-2.5">
        <div className="h-8 w-80 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-52 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <div className="h-80 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
