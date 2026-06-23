import dotenv from "dotenv";
import "reflect-metadata";
dotenv.config();

import sequelize from "../config/database.config";
import { Employee } from "../models";

const EMPLOYEES = [
  { uuid: "a1b2c3d4-0001-4000-8000-000000000001", name: "Alice Tan" },
  { uuid: "a1b2c3d4-0002-4000-8000-000000000002", name: "Bob Lim" },
  { uuid: "a1b2c3d4-0003-4000-8000-000000000003", name: "Carol Ng" },
  { uuid: "a1b2c3d4-0004-4000-8000-000000000004", name: "David Chen" },
  { uuid: "a1b2c3d4-0005-4000-8000-000000000005", name: "Eve Wong" },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    for (const emp of EMPLOYEES) {
      await Employee.upsert(emp);
    }

    console.log(`Seeded ${EMPLOYEES.length} employees.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
