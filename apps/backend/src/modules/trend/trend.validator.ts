import { param } from "express-validator";

export const trendValidation = [param("uuid").isUUID().withMessage("Event UUID is invalid")];
