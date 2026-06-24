import { ErrorCode } from "@common/types";
import { ERROR_MESSAGES } from "../constants/error-messages";

/**
 * Extracts a user-friendly error message from an axios error response.
 * Maps error codes to localized messages, falls back to raw message or default.
 *
 * @param {unknown} err - The caught error (typically an AxiosError).
 * @param {string} fallback - Default message if no structured error is found.
 * @returns {string} The resolved error message.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (
      err as {
        response?: {
          data?: {
            code?: string;
            error?: string;
            errors?: { msg: string }[];
          };
        };
      }
    ).response;
    const code = response?.data?.code as ErrorCode | undefined;
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    const msg = response?.data?.error;
    if (typeof msg === "string") return msg;
    const validationErrors = response?.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors[0].msg;
    }
  }
  return fallback;
}
