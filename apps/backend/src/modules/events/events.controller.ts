import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import * as eventsService from "./events.service";

/**
 * Handles GET /api/admin/events.
 * Returns a paginated event listing with optional search and open filter.
 *
 * @param {Request} req - Express request with query params: page, search, open.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function for error forwarding.
 * @returns {Promise<void>}
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = req.query.page as unknown as number;
    const search = req.query.search as string | undefined;
    const openOnly = req.query.open === "true";

    const result = await eventsService.listEvents(page, search, openOnly);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Handles GET /api/public/events.
 * Returns all currently open events for public dropdown selection.
 *
 * @param {Request} _req - Express request (unused).
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function for error forwarding.
 * @returns {Promise<void>}
 */
export async function listOpen(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const events = await eventsService.listOpenEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
}

/**
 * Handles POST /api/admin/events.
 * Creates a new event after input validation.
 *
 * @param {Request} req - Express request with event creation body.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function for error forwarding.
 * @returns {Promise<void>}
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await eventsService.createEvent(req.body);
    res.status(HttpStatusCode.Ok).json(null);
  } catch (err) {
    next(err);
  }
}
