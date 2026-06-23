import { NextFunction, Request, Response } from "express";
import { Employee } from "../../models/employee.model";

/**
 * Handles GET /api/admin/employees.
 * Returns all employees sorted by name.
 *
 * @param {Request} _req - Express request (unused).
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function for error forwarding.
 * @returns {Promise<void>}
 */
export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const employees = await Employee.findAll({
      attributes: ["uuid", "name"],
      order: [["name", "ASC"]],
    });
    res.json(employees);
  } catch (err) {
    next(err);
  }
}
