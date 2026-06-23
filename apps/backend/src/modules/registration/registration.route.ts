import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as registrationController from "./registration.controller";
import { registerValidation } from "./registration.validator";

const router: Router = Router();

router.post("/", registerValidation, validate, registrationController.register);

export default router;
