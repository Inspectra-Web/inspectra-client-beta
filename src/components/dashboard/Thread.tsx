import { useState } from "react";
import { Send } from "lucide-react";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";
import { timeAgo } from "@/lib/format";
import type { InquiryMessage, MessageAuthor } from "@/lib/inquiries";
import { cn } from "@/lib/cn";

/** Who a bubble belongs to. The reader is always on the right. */
export interface ThreadPerson {
  name: string;
  avatar: string;
}

/**
 * One conversation, rendered from either end. `mine` says which author the reader is,
 * so the seeker's console and the realtor's console share this component and each puts
 * its own messages on the right. Both pages held a copy of the bubble before this.
 */
export function Thread({
  messages,
  mine,
  me,
  them,
}: {
  messages: InquiryMessage[];
  mine: MessageAuthor;
  me: ThreadPerson;
  them: ThreadPerson;
}) {
  return (
    <div className="space-y-5">
      {messages.map((message) => {
        const out = message.author === mine;
        const who = out ? me : them;

        return (
          <div key={message.id} className={cn("flex gap-3", out && "flex-row-reverse")}>
            <UserAvatar name={who.name} avatar={who.avatar} className="size-9" />
            <div className={cn("max-w-[80%]", out && "text-right")}>
              <div className="mb-1 flex items-center gap-2 text-xs text-faint">
                {/* Labelled "You" but the avatar keeps real initials. */}
                <span className="font-medium text-muted">{out ? "You" : who.name}</span>
                <span>·</span>
                <span>{timeAgo(message.createdAt)}</span>
              </div>
              <p
                className={cn(
                  "inline-block whitespace-pre-wrap rounded-2xl px-4 py-3 text-left text-sm leading-relaxed",
                  out
                    ? "bg-brand/10 text-ink"
                    : "border border-line bg-surface-2/60 text-ink",
                )}
              >
                {message.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The reply box. It owns the draft so both consoles do not each hold that state, and
 * it clears only once `onSend` resolves: a message that failed to send has to stay in
 * the box, so the page rethrows after it has toasted.
 */
export function MessageComposer({
  placeholder,
  label,
  pending,
  onSend,
}: {
  placeholder: string;
  label: string;
  pending: boolean;
  onSend: (message: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");

  const send = async () => {
    const body = draft.trim();

    if (!body || pending) return;

    try {
      await onSend(body);
      setDraft("");
    } catch {
      // The page has already said what went wrong. Keep what they typed.
    }
  };

  return (
    <div className="mt-5 border-t border-line pt-4">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder={placeholder}
        aria-label={label}
        className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || pending}
          className={cn(buttonClasses("brand", "md"), "disabled:opacity-50")}
        >
          <Send className="size-4" aria-hidden />
          {pending ? "Sending…" : label}
        </button>
      </div>
    </div>
  );
}
