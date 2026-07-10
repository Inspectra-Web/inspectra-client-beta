import { ShieldCheck, Lock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * Right-panel proof vignettes for the dark auth panel. Each is a small, self-contained
 * trust cue: verification shown as a badge on a real photo (never a certificate), kept
 * consistent with the product's "show the trust" direction. Gold foil stays reserved for
 * the credential moment (CredentialProof).
 */

const HOME_IMAGE =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80";
const REALTOR_IMAGE =
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&crop=faces&w=900&q=80";

/** A verified home: badge on a real photo plus a short proof footer. */
export function VerifiedProof() {
  return (
    <figure className="max-w-sm overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0c1e2b] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
      <div className="relative aspect-[16/10]">
        <img
          src={HOME_IMAGE}
          alt="A verified INSPECTRA listing"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0c1e2b] via-transparent to-transparent" />
        <StatusBadge status="verified" onPhoto className="absolute left-4 top-4" />
      </div>
      <figcaption className="flex items-center gap-3 border-t border-white/10 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#38c0ff]/15 text-[#38c0ff]">
          <ShieldCheck className="size-4.5" aria-hidden />
        </span>
        <p className="text-sm leading-snug text-white/70">
          Title, documents and fees checked before it ever goes live.
        </p>
      </figcaption>
    </figure>
  );
}

/** A certified realtor credential, the one place gold foil is used. */
export function CredentialProof() {
  return (
    <figure className="flex max-w-sm items-center gap-4 rounded-[1.4rem] border border-white/10 bg-[#0c1e2b] p-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
        <img
          src={REALTOR_IMAGE}
          alt="A certified INSPECTRA realtor"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <figcaption className="min-w-0">
        <span className="credential-meta text-[0.6rem] text-foil">
          Certified Realtor
        </span>
        <p className="display mt-1 text-xl text-white">Adaeze Okafor</p>
        <p className="credential-meta mt-1 text-[0.6rem] text-white/50">
          INS-CR-2026-0473
        </p>
      </figcaption>
    </figure>
  );
}

/** Security reassurance for the password-recovery flows. */
export function SecurityProof() {
  return (
    <div className="flex max-w-sm items-center gap-4 rounded-[1.4rem] border border-white/10 bg-[#0c1e2b] p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#38c0ff]/15 text-[#38c0ff]">
        <Lock className="size-5" aria-hidden />
      </span>
      <p className="text-sm leading-snug text-white/70">
        Your account keeps every saved home, inspection and message in one trusted place.
      </p>
    </div>
  );
}
