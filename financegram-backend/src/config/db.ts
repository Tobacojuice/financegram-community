import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_URI = "mongodb://localhost:27017/financegram";
const MONGO_URI = process.env.MONGO_URI ?? DEFAULT_URI;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    return mongoose;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
