const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const timeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/**
 * Describes how long ago a moment was, in its largest whole unit, e.g. "3 hours ago" or "yesterday".
 *
 * @param {Date} date - The moment to describe.
 * @returns {string} The relative time, or "just now" for anything under a minute.
 */
export const timeAgo = (date: Date) => {
  const elapsed = date.getTime() - Date.now();
  const match = timeUnits.find(([, size]) => Math.abs(elapsed) >= size);

  if (!match) return "just now";

  const [unit, size] = match;

  return relativeTime.format(Math.round(elapsed / size), unit);
};

/**
 * Writes a count with its noun, adding an "s" for anything but one, e.g. "1 friend" or "3 friends".
 *
 * @param {number} count - How many there are.
 * @param {string} noun - The singular noun, e.g. "friend".
 * @returns {string} The count and noun together.
 */
export const countOf = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;
