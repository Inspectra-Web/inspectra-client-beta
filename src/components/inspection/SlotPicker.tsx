import { useState } from "react";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/cn";

/**
 * A date and a half-hour slot, which together make one appointment.
 *
 * The two halves are held separately because that is how a person picks a time, and
 * joined into the single ISO timestamp the API stores only on submit: the record has
 * no notion of a date without an hour, so neither half is meaningful on its own.
 *
 * Both halves are chosen, never typed. The native date input was replaced because it
 * renders as a different control in every browser and ignores the theme entirely; a
 * free-text time field invites 25:70, and a viewing at 3am is not a booking anyone
 * meant to make.
 */

const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;

// How far ahead a viewing may be booked. Mirrors HORIZON_DAYS in the server's
// inspection validator, so the calendar cannot offer a day the API would refuse.
const HORIZON_DAYS = 90;

/** 9:00 AM to 5:00 PM on the half hour, as { value: "14:30", label: "2:30 PM" }. */
const SLOTS = Array.from({ length: (CLOSE_HOUR - OPEN_HOUR) * 2 + 1 }, (_, i) => {
  const hour = OPEN_HOUR + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const value = `${String(hour).padStart(2, "0")}:${minute}`;

  return { value, label: dayjs(`2000-01-01T${value}`).format("h:mm A") };
});

const fieldClass =
  "flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm transition-colors hover:bg-surface-2 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60";

export function SlotPicker({
  date,
  time,
  onDate,
  onTime,
  disabled,
  className,
}: {
  /** "YYYY-MM-DD", or "" before a day is chosen. */
  date: string;
  /** "HH:mm", or "" before a slot is chosen. */
  time: string;
  onDate: (value: string) => void;
  onTime: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = date ? dayjs(date).toDate() : undefined;
  const today = dayjs().startOf("day");

  return (
    <div className={cn("grid grid-cols-2 gap-3 max-sm:grid-cols-1", className)}>
      <div className="min-w-0 space-y-1.5">
        <label className="text-sm font-medium text-ink">Date</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            aria-label="Date"
            disabled={disabled}
            className={cn(fieldClass, date ? "text-ink" : "text-muted")}
          >
            <CalendarDays className="size-4 shrink-0 text-faint" aria-hidden />
            <span className="truncate">
              {date ? dayjs(date).format("ddd, D MMM YYYY") : "Pick a date"}
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              autoFocus
              selected={selected}
              // The calendar cannot offer a day the API would refuse, so its bounds
              // are the request rules: today at the earliest, the horizon at the latest.
              startMonth={today.toDate()}
              endMonth={today.add(HORIZON_DAYS, "day").toDate()}
              disabled={{
                before: today.toDate(),
                after: today.add(HORIZON_DAYS, "day").toDate(),
              }}
              onSelect={(day) => {
                if (!day) return;
                onDate(dayjs(day).format("YYYY-MM-DD"));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* min-w-0: the trigger sets whitespace-nowrap, so without it the untruncated
          option text becomes the grid column's minimum width. */}
      <div className="min-w-0 space-y-1.5">
        <label className="text-sm font-medium text-ink">Time</label>
        <Select value={time} onValueChange={onTime} disabled={disabled}>
          <SelectTrigger
            aria-label="Time"
            className="h-11 w-full rounded-xl border-line bg-surface focus-visible:ring-brand/25"
          >
            <SelectValue placeholder="Pick a time" />
          </SelectTrigger>
          <SelectContent>
            {SLOTS.map((slot) => (
              <SelectItem key={slot.value} value={slot.value}>
                {slot.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
