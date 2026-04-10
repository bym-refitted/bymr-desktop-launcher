/**
 * Connection error message to be displayed when the server is unreachable.
 */
export const connectErrorMessage = "Could not connect to the server. Please check the server status on our Discord. There may be an ongoing maintenance break or outage.";

/**
 * Util which handles error messages based on the type of error received.
 * It checks if the error is an instance of Error, a string, otherwise defaultErrorMessage.
 *
 * @param {unknown} error - The error to handle.
 * @returns {string} - The error message to display.
 */
export const handleErrorMessage = (error: unknown): string => {
  const defaultErrorMessage = "An unexpected error occurred. Please try again later.";

  if (!error) return defaultErrorMessage;

  // object errors
  if (error instanceof Error) {
    const message = error.message.trim();

    if (message.includes("Failed to fetch")) return connectErrorMessage;
    
    if (message.includes("error sending request for url")) {
      const isLocal = message.includes("localhost") || message.includes("127.0.0.1");
      return isLocal
        ? "Could not reach the local server. Make sure it is running on the specified host and port."
        : connectErrorMessage;
    }

    return message || defaultErrorMessage;
  }

  // String errors
  if (typeof error === "string") return error;

  return defaultErrorMessage;
};
