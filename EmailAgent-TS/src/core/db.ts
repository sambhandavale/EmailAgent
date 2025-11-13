import mongoose from "mongoose";
import { logger } from "./logger";
import { MONGO_URI } from "./config";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: process.env.DB_NAME || undefined,
    });
    logger.info("MongoDB connected (Mongoose)");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
}
