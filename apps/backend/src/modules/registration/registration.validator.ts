import { body } from "express-validator";

export const registerValidation = [
  body("eventUuid").isUUID(),
  body("emailAddress").isEmail().normalizeEmail(),
];
