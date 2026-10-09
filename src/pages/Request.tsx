import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, ClipboardList, Loader2, MailCheck, PartyPopper, Plus, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { RequestForm, type RequestFormResult } from "@/components/request/RequestForm";
import { RequestSummary } from "@/components/request/RequestSummary";
import { homeFor, useMe } from "@/lib/auth";
import { ACTIVE_REQUESTS_MAX, requestState, useMyRequests } from "@/lib/requests";

/**
 * The seeker waitlist. INSPECTRA lists nothing yet, so this is the one thing a seeker
 * can do: say what they want, and be told first when verified homes that match go live.
 */
export function Request() {
  const { data: user, isPending: userPending } = useMe();
  const seeker = user?.role === "seeker";
  // A seeker at the cap would fill the whole form only to be refused at the end, so
  // they are told up front instead.
  const mine = useMyRequests(seeker);
  const live = (mine.data ?? []).filter((r) => requestState(r) === "active").length;
  const full = seeker && live >= ACTIVE_REQUESTS_MAX;
  const isPending = userPending || (seeker && mine.isPending);
  const [result, setResult] = useState<RequestFormResult | null>(null);
  // Remounts the form for "file another", so it starts from a clean slate.
  const [round, setRound] = useState(0);

  return (
    <section className="bg-bg py-16 max-sm:py-10">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">
            Lagos, Abuja, Port Harcourt
          </p>
          <h1 className="display mt-3 text-[2.75rem] leading-[1.05] text-ink text-balance max-md:text-4xl max-sm:text-[2rem]">
            Tell us the home you're looking for.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-sm:text-[0.95rem]">
            We're opening soon. File your request now and you'll be among the first to hear when
            verified homes that match it go live.
          </p>
        </div>

        <div className="mt-10 max-sm:mt-8">
          {isPending ? (
            <div className="grid min-h-[24rem] place-items-center rounded-3xl border border-line bg-surface">
              <Loader2 className="size-6 animate-spin text-faint" aria-label="Loading" />
            </div>
          ) : user && user.role !== "seeker" ? (
            <Notice
              Icon={UserRound}
              title="Requests are for seeker accounts"
              body="You're signed in as a realtor or admin. Sign in with a seeker account to file a property request."
              actions={<Link to={homeFor(user.role)} className={buttonClasses("brand", "md")}>Go to your dashboard <ArrowRight className="size-4" aria-hidden /></Link>}
            />
          ) : result?.kind === "joined" ? (
            <Notice
              Icon={MailCheck}
              title="Check your email"
              body={
                <>
                  We sent a link to <span className="font-medium text-ink">{result.email}</span>. Verify
                  your address to activate your account. After that you can sign in any time to edit or
                  renew your request.
                </>
              }
              summary={<RequestSummary request={result.request} />}
              actions={<Link to="/" className={buttonClasses("outline", "md")}>Back to home</Link>}
            />
          ) : result?.kind === "filed" ? (
            <Notice
              Icon={PartyPopper}
              title="Your request is in"
              body="We'll let you know when verified homes that match it go live."
              summary={<RequestSummary request={result.request} />}
              actions={
                <>
                  <Link to="/dashboard/requests" className={buttonClasses("brand", "md")}>View your requests <ArrowRight className="size-4" aria-hidden /></Link>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setRound((r) => r + 1);
                    }}
                    className={buttonClasses("outline", "md")}
                  >
                    <Plus className="size-4" aria-hidden /> File another
                  </button>
                </>
              }
            />
          ) : full ? (
            <Notice
              Icon={ClipboardList}
              title={`You have ${ACTIVE_REQUESTS_MAX} active requests`}
              body="That's the most you can hold at once. Close one you no longer need, then file a new one."
              actions={<Link to="/dashboard/requests" className={buttonClasses("brand", "md")}>Manage your requests <ArrowRight className="size-4" aria-hidden /></Link>}
            />
          ) : (
            <RequestForm
              key={round}
              mode={user ? "seeker" : "join"}
              onDone={(done) => {
                setResult(done);
                // The panel is far shorter than the form it replaces.
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      </Container>
    </section>
  );
}

function Notice({
  Icon, title, body, summary, actions,
}: {
  Icon: typeof MailCheck;
  title: string;
  body: ReactNode;
  summary?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-10 max-sm:p-6">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand-ink">
        <Icon className="size-5.5" aria-hidden />
      </span>
      <h2 className="display mt-5 text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      {summary && <div className="mt-6">{summary}</div>}
      <div className="mt-7 flex flex-wrap gap-3">{actions}</div>
    </div>
  );
}
