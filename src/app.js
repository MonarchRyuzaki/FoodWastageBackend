import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config({
  path: "../.env",
});

import authRoutes from "./routes/auth.routes.js";
import foodDonationRoutes from "./routes/donation.routes.js";
import claimRoutes from "./routes/claims.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food-donations", foodDonationRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;

