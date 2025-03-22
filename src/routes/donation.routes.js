import express from "express";
import { createFoodDonation, deleteFoodDonation, getFoodDonation, getFoodDonationDetails, updateFoodDonation } from "../controllers/donation.js";
import { verifyAuthToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyAuthToken, createFoodDonation);
router.get("/", getFoodDonation);
router.get("/:id", getFoodDonationDetails);
router.put("/:id", verifyAuthToken, updateFoodDonation);
router.delete("/:id", verifyAuthToken, deleteFoodDonation);

export default router;
