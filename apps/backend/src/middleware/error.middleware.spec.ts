import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./error.middleware";
import { ClientError, ValidationError } from "../errors";

jest.mock("../config/logger.config", () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("error.middleware", () => {
  const req = {} as Request;
  const next = jest.fn() as NextFunction;

  it("should return 421 for ValidationError", () => {
    const res = createMockRes();
    errorHandler(new ValidationError("Invalid input"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(421);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
  });

  it("should return 400 for ClientError", () => {
    const res = createMockRes();
    errorHandler(new ClientError("Not found"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("should return 500 for unexpected errors", () => {
    const res = createMockRes();
    errorHandler(new Error("Something broke"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
