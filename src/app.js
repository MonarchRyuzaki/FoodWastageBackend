import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import authRoutes from "./routes/auth.routes.js";
import foodDonationRoutes from "./routes/donation.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food-donations", foodDonationRoutes);

export default app;
