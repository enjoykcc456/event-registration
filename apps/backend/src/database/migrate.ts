import dotenv from "dotenv";
import "reflect-metadata";
dotenv.config();

import sequelize from "../config/database.config";
import "../models";

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
    await sequelize.sync({ alter: true });
    console.log("Database schema synchronised.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
