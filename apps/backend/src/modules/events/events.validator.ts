import { body, query } from "express-validator";

export const listEventsValidation = [
  query("page").isInt({ min: 1 }).toInt(),
  query("search").optional().isString().trim(),
  query("open").optional().isString(),
];

export const createEventValidation = [
  body("name").isString().trim().notEmpty().withMessage("Event name is required"),
  body("dateTime").isISO8601().withMessage("Date & time must be valid"),
  body("postalCode")
    .isString()
    .matches(/^\d{6}$/)
    .withMessage("Postal code must be 6 digits"),
  body("deadline").isISO8601().withMessage("Deadline must be valid"),
  body("capacity").isInt({ min: 1 }).toInt().withMessage("Capacity must be at least 1"),
  body("handlerUuid").isUUID().withMessage("Handler is required"),
];
