import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as eventsController from "./events.controller";
import {
  createEventValidation,
  listEventsValidation,
} from "./events.validator";

const router: Router = Router();

router.get("/", listEventsValidation, validate, eventsController.list);
router.post("/", createEventValidation, validate, eventsController.create);

export default router;
