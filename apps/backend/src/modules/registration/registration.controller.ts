import { NextFunction, Request, Response } from "express";
import * as registrationService from "./registration.service";

/**
 * Handles POST /api/public/register.
 * Registers a user for an event after input validation.
 *
 * @param {Request} req - Express request with eventUuid and emailAddress in body.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function for error forwarding.
 * @returns {Promise<void>}
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { eventUuid, emailAddress } = req.body as {
      eventUuid: string;
      emailAddress: string;
    };

    const result = await registrationService.register(eventUuid, emailAddress);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
