// src/db.js
import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  const opts = {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000, // 10s
    // Nếu bạn tách DB name ra env riêng:
    dbName: process.env.MONGODB_DB || undefined,
  };

  try {
    const conn = await mongoose.connect(config.mongoUri, opts);
    const { host, name } = conn.connection;
    console.log(`✅ MongoDB connected → host: ${host} | db: ${name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};
