import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowLeft, Send, Inbox, CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { BuyerSummary } from "@/components/realtor/BuyerSummary";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { leadById, realtor } from "@/data/realtor";
import { propertyById } from "@/data/mock";
import { cn } from "@/lib/cn";

export function RealtorLeadDetail() {
  const { id } = useParams();
  const lead = id ? leadById(id) : undefined;
  const property = lead ? propertyById(lead.propertyId) : undefined;

  const [draft, setDraft] = useState("");

  if (!lead || !property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Inbox className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Lead not found</h1>
        <p className="mt-2 text-muted">This lead may have been removed.</p>
        <Link to="/realtor/leads" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to leads
        </Link>
      </div>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    toast.success("Reply sent");
    setDraft("");
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
          title={lead.buyerName}
          subtitle={`Inquiry on ${property.title}`}
          actions={<StatusPill status={lead.status} />}
        />
      </Reveal>

      <div className="grid grid-cols-[1fr_20rem] items-start gap-6 max-lg:grid-cols-1">
        {/* conversation */}
        <Reveal y={16}>
          <Panel title="Conversation">
            <div className="space-y-5">
              <Bubble
                side="in"
                avatar={lead.buyerAvatar}
                name={lead.buyerName}
                at={lead.at}
                text={lead.message}
              />
              {lead.status === "responded" && lead.reply && (
                <Bubble side="out" avatar={realtor.avatar} name="You" at="Replied" text={lead.reply} />
              )}
            </div>

            {/* composer */}
            <div className="mt-5 border-t border-line pt-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder={`Reply to ${lead.buyerName.split(" ")[0]}…`}
                className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={send}
                  disabled={!draft.trim()}
                  className={cn(buttonClasses("brand", "md"), "disabled:opacity-50")}
                >
                  <Send className="size-4" aria-hidden />
                  Send reply
                </button>
              </div>
            </div>
          </Panel>
        </Reveal>

        {/* aside */}
        <Reveal y={16} className="space-y-4">
          <BuyerSummary name={lead.buyerName} avatar={lead.buyerAvatar} />
          <PropertySummary property={property} />
          <Link to="/realtor/inspections" className={buttonClasses("outline", "md", "w-full")}>
            <CalendarPlus className="size-4" aria-hidden />
            Schedule inspection
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

function Bubble({
  side,
  avatar,
  name,
  at,
  text,
}: {
  side: "in" | "out";
  avatar: string;
  name: string;
  at: string;
  text: string;
}) {
  const out = side === "out";
  return (
    <div className={cn("flex gap-3", out && "flex-row-reverse")}>
      <img
        src={avatar}
        alt={name}
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
      />
      <div className={cn("max-w-[80%]", out && "text-right")}>
        <div className="mb-1 flex items-center gap-2 text-xs text-faint">
          <span className="font-medium text-muted">{name}</span>
          <span>·</span>
          <span>{at}</span>
        </div>
        <p
          className={cn(
            "inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed",
            out ? "bg-brand/10 text-ink" : "border border-line bg-surface-2/60 text-ink",
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
