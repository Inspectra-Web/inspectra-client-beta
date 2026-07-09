import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Types each word out, pauses, deletes, and moves to the next — looping.
 * Under reduced-motion, renders the first word statically (no animation).
 */
export function Typewriter({
  words,
  className,
  typingMs = 90,
  deletingMs = 45,
  holdMs = 1400,
}: {
  words: string[];
  className?: string;
  typingMs?: number;
  deletingMs?: number;
  holdMs?: number;
}) {
  const reduced = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const current = words[wordIndex % words.length];

    // Finished typing → hold, then start deleting.
    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(t);
    }
    // Finished deleting → advance to next word.
    if (deleting && text === "") {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    const t = setTimeout(
      () => {
        setText((prev) =>
          deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
        );
      },
      deleting ? deletingMs : typingMs,
    );
    return () => clearTimeout(t);
  }, [text, deleting, wordIndex, words, reduced, typingMs, deletingMs, holdMs]);

  if (reduced) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span>{text}</span>
      <span
        aria-hidden
        className="ml-0.5 inline-block w-[0.06em] self-stretch animate-[caret_1s_steps(1)_infinite] bg-current"
      />
    </span>
  );
}
