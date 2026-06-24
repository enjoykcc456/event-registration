import { ErrorCode } from "@common/types";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.EVENT_NOT_FOUND]: "The event you selected no longer exists.",
  [ErrorCode.EVENT_NOT_OPEN]:
    "Sorry, registration for this event has closed.",
  [ErrorCode.DEADLINE_MUST_BE_BEFORE_EVENT]:
    "Registration deadline must be before the event date.",
  [ErrorCode.EVENT_NAME_ALREADY_EXISTS]:
    "An event with this name already exists.",
  [ErrorCode.HANDLER_NOT_FOUND]: "The selected handler could not be found.",
  [ErrorCode.HANDLER_HAS_OPEN_EVENT]:
    "This handler already manages an active event.",
  [ErrorCode.POSTAL_CODE_NOT_FOUND]:
    "No address found for the given postal code.",
};
