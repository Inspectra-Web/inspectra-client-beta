import { Link, useParams } from "react-router";
import { ArrowLeft, ClipboardList, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { RequestSummary } from "@/components/request/RequestSummary";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import { STATE_PILL, useAdminRequest, type AdminRequestDetail } from "@/lib/adminRequests";
import { displayName, formatDate, formatPhone, whatsappDigits } from "@/lib/format";
import { requestTitle } from "@/lib/requestSchema";

const LIVE_MAX = 3;

export function AdminRequestDetail() {
  const { id = "" } = useParams();
  const { data, isPending, isError, error } = useAdminRequest(id);

  return (
    <div className="space-y-6">
      <Link
        to="/admin/requests"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to requests
      </Link>

      {isPending ? (
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />
      ) : isError ? (
        <EmptyState icon={ClipboardList} title="Could not load this request" message={apiMessage(error)} />
      ) : (
        <Loaded request={data} />
      )}
    </div>
  );
}

function Loaded({ request }: { request: AdminRequestDetail }) {
  const { seeker } = request;
  const name = displayName(seeker.fullname);
  const phone = seeker.whatsapp || seeker.phone;
  const wantsWhatsapp = seeker.contactMeans.includes("WhatsApp");
  const expired = request.state === "expired";

  return (
    <>
      <Reveal>
        <PageHeader
          title={requestTitle(request)}
          subtitle={`${request.ref} · Filed ${formatDate(request.createdAt)}`}
          actions={<StatusPill status={STATE_PILL[request.state]} />}
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="min-w-0">
          <Panel title="The brief">
            <RequestSummary request={request} />
            {request.state !== "closed" && (
              <p className="mt-3 text-xs text-faint">
                {expired ? "Expired" : "Expires"} {formatDate(request.expiresAt)}
              </p>
            )}
          </Panel>
        </Reveal>

        <Reveal y={16} className="space-y-4">
          <Link
            to={`/admin/users/${seeker.id}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40"
          >
            <UserAvatar name={name} avatar={seeker.avatar} className="size-10" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">Seeker</p>
              <p className="truncate font-medium text-ink">{name}</p>
              <p className="truncate text-xs text-muted">{seeker.email}</p>
              {!seeker.verified && (
                <p className="mt-0.5 text-[0.7rem] font-semibold text-gold">Email not verified</p>
              )}
            </div>
          </Link>

          <Panel title="Contact">
            <div className="space-y-2.5 text-sm">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-ink hover:text-brand-ink">
                  <Phone className="size-4 text-faint" aria-hidden />
                  {formatPhone(phone)}
                </a>
              )}
              {phone && wantsWhatsapp && (
                <a
                  href={`https://wa.me/${whatsappDigits(phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-ink hover:text-brand-ink"
                >
                  <MessageCircle className="size-4 text-faint" aria-hidden />
                  WhatsApp
                </a>
              )}
              <a href={`mailto:${seeker.email}`} className="flex min-w-0 items-center gap-2 text-ink hover:text-brand-ink">
                <Mail className="size-4 shrink-0 text-faint" aria-hidden />
                <span className="truncate">{seeker.email}</span>
              </a>
            </div>
            {seeker.contactMeans && (
              <p className="mt-4 text-xs text-muted">Prefers {seeker.contactMeans}</p>
            )}
          </Panel>

          <p className="px-1 text-xs text-muted">
            {name} has{" "}
            <span className="font-semibold tabular-nums text-ink">
              {request.seekerLive} of {LIVE_MAX}
            </span>{" "}
            live requests.
          </p>
        </Reveal>
      </div>
    </>
  );
}
