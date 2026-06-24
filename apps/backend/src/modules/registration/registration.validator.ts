import { body } from "express-validator";

export const registerValidation = [
  body("eventUuid").isUUID().withMessage("Event is required"),
  body("emailAddress").isEmail().withMessage("Email address is invalid").normalizeEmail(),
];
