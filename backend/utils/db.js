import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Always load Backend/.env (seed.js also relies on this)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    // console.log("MongoDB URI:", mongoUri ? "found" : "missing");
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in Backend/.env");
    }
    await mongoose.connect(mongoUri);
    // console.log("mongodb connected successfully");
  } catch (error) {
    // console.log("MongoDB connection error:", error);
    throw error;
  }
};
export default connectDB;
