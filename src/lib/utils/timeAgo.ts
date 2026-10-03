const MINUTE_MS = 60_000;
const HOUR_MINUTES = 60;
const DAY_HOURS = 24;

/**
 * Describes how long ago a timestamp was, in the coarsest unit that still says
 * something useful: "just now", "5 min ago", "3 hrs ago", "2 days ago".
 *
 * @param {string | Date | null} value - When it happened, or null if unknown.
 * @returns {string} The relative time, or an empty string when there is nothing to describe.
 */
export const timeAgo = (value: string | Date | null): string => {
  if (!value) return "";

  const minutes = Math.floor(
    (Date.now() - new Date(value).getTime()) / MINUTE_MS,
  );

  if (minutes < 1) return "just now";
  if (minutes < HOUR_MINUTES) return `${minutes} min ago`;

  const hours = Math.floor(minutes / HOUR_MINUTES);

  if (hours < DAY_HOURS) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / DAY_HOURS);

  return `${days} day${days === 1 ? "" : "s"} ago`;
};
