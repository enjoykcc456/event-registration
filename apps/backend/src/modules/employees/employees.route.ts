import { Router } from "express";
import * as employeesController from "./employees.controller";

const router: Router = Router();

router.get("/", employeesController.list);

export default router;
