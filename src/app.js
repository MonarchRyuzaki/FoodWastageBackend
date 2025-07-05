import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config({
  path: "../.env",
});

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import claimRoutes from "./routes/claims.routes.js";
import foodDonationRoutes from "./routes/donation.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// Increase JSON payload limit for better performance
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Conditional logging - disable in benchmark mode for performance
if (process.env.NODE_ENV !== "benchmark") {
  app.use(morgan("dev"));
}

// Optimize express settings for high concurrency
if (process.env.NODE_ENV === "benchmark") {
  app.set("trust proxy", 1);
  // Disable x-powered-by header
  app.disable("x-powered-by");
  // Disable etag for benchmarking
  app.disable("etag");
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food-donations", foodDonationRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
