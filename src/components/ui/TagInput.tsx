import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/** Highlight the matched portion of a suggestion. */
function highlight(label: string, q: string) {
  const i = q ? label.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return label;
  return (
    <>
      {label.slice(0, i)}
      <span className="font-semibold text-ink">{label.slice(i, i + q.length)}</span>
      {label.slice(i + q.length)}
    </>
  );
}

/**
 * Type-ahead tag input: chips for chosen values, an input that suggests from a canonical
 * list as you type (so wording stays consistent), plus the option to add your own.
 * Enter is prevented + stopped so it never submits a surrounding form / advances a wizard.
 */
export function TagInput({
  value: rawValue, onChange, suggestions, placeholder,
}: {
  value: string[]; onChange: (next: string[]) => void; suggestions: string[]; placeholder?: string;
}) {
  const value = Array.isArray(rawValue) ? rawValue : [];
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const query = q.trim();
  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return suggestions
      .filter((s) => !value.includes(s) && (!lower || s.toLowerCase().includes(lower)))
      .slice(0, 8);
  }, [query, suggestions, value]);

  const canAddCustom =
    !!query &&
    !value.some((x) => x.toLowerCase() === query.toLowerCase()) &&
    !suggestions.some((s) => s.toLowerCase() === query.toLowerCase());

  const rows = [
    ...filtered.map((label) => ({ kind: "suggest" as const, label })),
    ...(canAddCustom ? [{ kind: "custom" as const, label: query }] : []),
  ];

  const add = (tag: string) => {
    const t = tag.trim();
    if (t && !value.some((x) => x.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setQ("");
    setActive(0);
  };
  const remove = (tag: string) => onChange(value.filter((x) => x !== tag));

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(rows.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (rows[active]) add(rows[active].label);
      else if (query) add(query);
    } else if (e.key === "Backspace" && !q && value.length) {
      remove(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-transparent bg-surface-2 p-1.5 transition-colors",
          "focus-within:border-brand focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand/25",
        )}
        onClick={() => setOpen(true)}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-brand/10 py-1 pl-2.5 pr-1 text-sm font-medium text-brand-ink">
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(tag); }}
              aria-label={`Remove ${tag}`}
              className="grid size-5 place-items-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand/15 hover:text-brand-ink"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? "" : placeholder}
          className="min-w-[9rem] flex-1 bg-transparent px-2 py-1 text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      {open && rows.length > 0 && (
        <ul className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface p-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.28)]">
          {rows.map((row, i) => (
            <li key={`${row.kind}-${row.label}`}>
              <button
                type="button"
                // mousedown so it fires before the input blurs
                onMouseDown={(e) => { e.preventDefault(); add(row.label); }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  i === active ? "bg-surface-2 text-ink" : "text-muted",
                )}
              >
                {row.kind === "custom" ? (
                  <>
                    <Plus className="size-4 shrink-0 text-brand-ink" aria-hidden />
                    Add <span className="font-medium text-ink">&ldquo;{row.label}&rdquo;</span>
                  </>
                ) : (
                  <span className="text-muted">{highlight(row.label, query)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
