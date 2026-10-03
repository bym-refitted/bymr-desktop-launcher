import { ErrorCode } from "$lib/enums/ErrorCode";

/**
 * An error that keeps the status the server answered with, so a caller can tell a
 * rejected session from an unreachable server.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Whether an error is the server refusing our token, rather than refusing the action.
 *
 * @param {unknown} error - The error thrown by invokeApiRequest.
 * @returns {boolean} True only when the stored session is the thing being rejected.
 */
export const isSessionError = (error: unknown) => error instanceof ApiError && error.code === ErrorCode.SESSION_INVALID;
