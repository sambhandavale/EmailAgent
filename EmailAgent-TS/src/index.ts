import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./core/db";
import { startScheduler } from "./core/scheduler";
import { logger } from "./core/logger";
import { routes } from "./routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
routes(app);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(); // Wait until connection is ready

    // Start server immediately after connection
    app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

    // Now safely start scheduler
    startScheduler();

    mongoose.connection.on("error", err => {
      logger.error("❌ MongoDB connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

  } catch (err) {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
