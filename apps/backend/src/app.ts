import cors from "cors";
import express, { Express } from "express";
import { errorHandler } from "./middleware/error.middleware";
import employeesRouter from "./modules/employees/employees.route";
import adminEventsRouter from "./modules/events/events-admin.route";
import publicEventsRouter from "./modules/events/events-public.route";
import registrationRouter from "./modules/registration/registration.route";
import trendRouter from "./modules/trend/trend.route";

const app: Express = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:8001",
  }),
);
app.use(express.json());

// Admin routes
app.use("/api/admin/events", adminEventsRouter);
app.use("/api/admin/events", trendRouter);
app.use("/api/admin/employees", employeesRouter);

// Public routes
app.use("/api/public/events", publicEventsRouter);
app.use("/api/public/register", registrationRouter);

// Error handler must be last
app.use(errorHandler);

export default app;
