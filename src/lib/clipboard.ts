import { useState } from "react";
import { toast } from "react-toastify";

/** Copies text and shows a tick for two seconds; `what` names it in the fallback message. */
export function useCopy(what: string) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Could not copy. Select the ${what} instead.`);
    }
  };

  return { copied, copy };
}
