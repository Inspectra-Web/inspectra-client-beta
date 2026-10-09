import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequestForm } from "@/components/request/RequestForm";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useMyRequest } from "@/lib/requests";
import { requestTitle } from "@/lib/requestSchema";

export function RequestEdit() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: request, isPending, isError, error } = useMyRequest(id);
  const back = `/dashboard/requests/${id}`;

  if (isPending) return <div className="h-[36rem] animate-pulse rounded-3xl bg-surface-2" />;

  // The API refuses an edit to a closed request, so the form is not offered for one.
  if (isError || request.status === "closed")
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <ClipboardList className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">
          {isError ? "Request not found" : "This request is closed"}
        </h1>
        <p className="mt-2 max-w-sm text-muted">
          {isError
            ? apiMessage(error, "This request may have been removed.")
            : "A closed request can't be edited. File a new one if you start looking again."}
        </p>
        <Link to={isError ? "/dashboard/requests" : back} className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          {isError ? "Back to requests" : "Back to request"}
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <Link
        to={back}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to request
      </Link>

      <Reveal>
        <PageHeader title="Edit request" subtitle={requestTitle(request)} />
      </Reveal>

      <RequestForm
        mode="edit"
        initial={request}
        cancelTo={back}
        onDone={() => {
          toast.success("Changes saved.");
          navigate(back);
        }}
      />
    </div>
  );
}
