import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware that checks express-validator results and returns 421 if validation failed.
 * Place after validation chains in the route definition to short-circuit before the controller.
 *
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function.
 * @returns {void}
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res
      .status(HttpStatusCode.MisdirectedRequest)
      .json({ errors: errors.array() });
    return;
  }

  next();
}
