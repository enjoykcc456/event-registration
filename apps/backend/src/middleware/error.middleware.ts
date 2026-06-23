/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import { ClientError, ValidationError } from "../errors";

/**
 * Global error handler middleware.
 * Catches errors thrown from controllers/services and maps them to appropriate HTTP responses.
 *
 * @param {Error} err - The thrown error.
 * @param {Request} _req - Express request (unused).
 * @param {Response} res - Express response.
 * @param {NextFunction} _next - Express next function (unused).
 * @returns {void}
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ message: err.message, name: err.name, stack: err.stack });

  if (err instanceof ValidationError) {
    res.status(HttpStatusCode.MisdirectedRequest).json({ error: err.message });
    return;
  }

  if (err instanceof ClientError) {
    res.status(HttpStatusCode.BadRequest).json({ error: err.message });
    return;
  }

  res
    .status(HttpStatusCode.InternalServerError)
    .json({ error: "Internal server error" });
}
