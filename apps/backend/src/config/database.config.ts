import dotenv from "dotenv";
import "reflect-metadata";
import { Sequelize } from "sequelize-typescript";
import { Employee } from "../models/employee.model";
import { Event } from "../models/event.model";
import { Registration } from "../models/registration.model";
import logger from "./logger.config";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  database: process.env.DB_NAME || "event_registration",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  models: [Employee, Event, Registration],
  logging: (msg: string) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: false,
  },
});

export default sequelize;
