/**
 * Whether the stored token has been checked with the server yet.
 */
export enum SessionState {
  UNKNOWN = "unknown",
  VALID = "valid",
  SIGNED_OUT = "signedOut",
}
