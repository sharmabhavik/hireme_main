import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import interviewRoute from "./routes/interview.route.js";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// Fix for __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname); // Go up one level to project root

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration with environment variable support
const allowedOrigins = new Set(
  (process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:4173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:4173",
    ]
  ).concat([
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:4173",
  ]),
);

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser clients (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/interview", interviewRoute);

// Serve static files from frontend/dist
app.use(express.static(path.join(projectRoot, "frontend/dist")));

// Catch-all route for client-side routing (SPA)
app.use((_, res) => {
  res.sendFile(path.resolve(projectRoot, "frontend/dist/index.html"));
});

// Connect to DB first, then start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
