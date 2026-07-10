import { Link } from "react-router";
import { MessageSquare, Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { inquiries, type Inquiry } from "@/data/seeker";
import { propertyById, realtorById } from "@/data/mock";

export function Inquiries() {
  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Inquiries"
          subtitle="Messages you've sent to realtors, and their replies."
        />
      </Reveal>

      {inquiries.length ? (
        <div className="space-y-4">
          {inquiries.map((q, i) => (
            <Reveal key={q.id} y={14} delay={i * 0.04}>
              <InquiryRow inquiry={q} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal y={16}>
          <EmptyState
            icon={MessageSquare}
            title="No inquiries yet"
            message="Reach out from any listing to ask about documents, pricing or a viewing."
            action={
              <Link to="/listings" className={buttonClasses("brand", "md")}>
                <Search className="size-4" aria-hidden />
                Browse listings
              </Link>
            }
          />
        </Reveal>
      )}
    </div>
  );
}

function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const property = propertyById(inquiry.propertyId);
  const realtor = realtorById(inquiry.realtorId);
  if (!property) return null;

  return (
    <article className="group relative rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]">
      <Link
        to={`/dashboard/inquiries/${inquiry.id}`}
        aria-label={`Open inquiry about ${property.title}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      <div className="flex items-start gap-4">
        <img
          src={property.image}
          alt={property.title}
          className="size-16 shrink-0 rounded-xl object-cover max-sm:size-14"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-semibold text-ink">{property.title}</h3>
              <p className="line-clamp-1 text-sm text-muted">
                {property.location}, {property.city}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <StatusPill status={inquiry.status} />
              <span className="text-xs text-faint">{inquiry.sentAt}</span>
            </div>
          </div>

          {realtor && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <img
                src={`${realtor.avatar}?auto=format&fit=facearea&facepad=3&w=56&h=56&q=80`}
                alt={realtor.name}
                className="size-6 rounded-full object-cover ring-1 ring-line"
              />
              <span className="font-medium text-ink">{realtor.name}</span>
            </div>
          )}

          <p className="mt-3 line-clamp-1 text-sm text-muted">{inquiry.message}</p>
        </div>

        <ChevronRight className="mt-1 size-5 shrink-0 self-center text-faint transition-colors group-hover:text-brand-ink" />
      </div>
    </article>
  );
}
