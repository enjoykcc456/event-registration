import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as trendController from "./trend.controller";
import { trendValidation } from "./trend.validator";

const router: Router = Router();

router.post("/:uuid/trend", trendValidation, validate, trendController.getTrend);

export default router;
