import { NextFunction, Request, Response } from "express";
import * as trendService from "./trend.service";

/**
 * Handles POST /api/admin/events/:uuid/trend.
 * Returns daily registration trend data for a given event.
 *
 * @param {Request} req - Express request with uuid path param.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function for error forwarding.
 * @returns {Promise<void>}
 */
export async function getTrend(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trend = await trendService.calculateTrend(req.params.uuid);
    res.json(trend);
  } catch (err) {
    next(err);
  }
}
