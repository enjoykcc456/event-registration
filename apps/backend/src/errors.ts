import { ErrorCode } from "@common/types";

export class ValidationError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

export class ClientError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "ClientError";
    this.code = code;
  }
}
