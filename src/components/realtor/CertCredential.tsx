import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function monthYear(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}

/**
 * The realtor's earned INSPECTRA credential: a modern digital credential (photo + verifiable
 * data footer), not a paper certificate. The one sanctioned foil moment on the page. Pass
 * `stamp` to re-run the "Certified" seal animation (e.g. the instant they pass the exam).
 */
export function CertCredential({
  name,
  photo,
  credentialId,
  issuedOn,
  stamp = false,
}: {
  name: string;
  photo: string;
  credentialId: string;
  issuedOn: string;
  stamp?: boolean;
}) {
  return (
    <div className="relative w-full max-w-sm">
      {/* foil edge glow */}
      <div className="absolute -inset-px rounded-[1.6rem] bg-foil opacity-40 blur-[1px]" aria-hidden />

      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1e2b] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        {/* photo */}
        <div className="relative aspect-[4/5]">
          <img
            src={photo}
            alt={`${name}, a certified INSPECTRA realtor`}
            className="absolute inset-0 size-full object-cover object-[center_18%]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0c1e2b] via-transparent to-transparent" />

          {/* the stamped seal: the signature moment */}
          <div
            className={cn(
              "absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/5 [transform-origin:top_right]",
              stamp && "cert-stamp",
            )}
          >
            <span className="grid size-6 place-items-center rounded-full bg-foil">
              <BadgeCheck className="size-4 text-[#06121b]" strokeWidth={2.75} aria-hidden />
            </span>
            <span className="text-xs font-bold tracking-wide text-slate-900">Certified</span>
          </div>
        </div>

        {/* verifiable data footer */}
        <div className="space-y-3 border-t border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="credential-meta text-[0.62rem] text-foil">Certified Realtor</span>
            <span className="credential-meta text-[0.62rem] text-white/40">INSPECTRA</span>
          </div>
          <p className="display text-2xl text-white">{name}</p>
          <div className="credential-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.62rem] text-white/55">
            <span>{credentialId}</span>
            <span className="text-white/25">·</span>
            <span>Issued {monthYear(issuedOn)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
