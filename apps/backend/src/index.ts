import dotenv from "dotenv";
import "reflect-metadata";
dotenv.config();

import app from "./app";
import sequelize from "./config/database.config";
import logger from "./config/logger.config";

const PORT = parseInt(process.env.PORT || "8000", 10);

async function start() {
  await sequelize.authenticate();
  logger.info("Database connection established.");
  await sequelize.sync({ force: false });
  logger.info("Database schema synchronised.");

  app.listen(PORT, () => {
    logger.info(`Backend API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
