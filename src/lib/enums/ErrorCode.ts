/**
 * Machine readable reason the server refused a request, mirroring the server's own
 * ErrorCode enum. Only the codes the launcher reacts to are listed.
 *
 * @enum {string}
 */
export enum ErrorCode {
  SESSION_INVALID = "SESSION_INVALID",
}
