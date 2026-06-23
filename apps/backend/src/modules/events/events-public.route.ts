import { Router } from "express";
import * as eventsController from "./events.controller";

const router: Router = Router();

router.get("/", eventsController.listOpen);

export default router;
