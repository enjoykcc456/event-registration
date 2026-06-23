import { body, query } from "express-validator";

export const listEventsValidation = [
  query("page").isInt({ min: 1 }).toInt(),
  query("search").optional().isString().trim(),
  query("open").optional().isString(),
];

export const createEventValidation = [
  body("name").isString().trim().notEmpty(),
  body("dateTime").isISO8601(),
  body("postalCode")
    .isString()
    .matches(/^\d{6}$/),
  body("deadline").isISO8601(),
  body("capacity").isInt({ min: 1 }).toInt(),
  body("handlerUuid").isUUID(),
];
