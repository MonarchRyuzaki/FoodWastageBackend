import express from "express";
import { foodImagesUpload } from "../config/multer.js";
import {
  createFoodDonation,
  deleteFoodDonation,
  getFoodDonation,
  getFoodDonationDetails,
  updateFoodDonation,
} from "../controllers/donation.js";
import { verifyAuthToken } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.post(
  "/",
  verifyAuthToken,
  checkRole("Donor"),
  foodImagesUpload,
  createFoodDonation
);
router.get("/", getFoodDonation);
router.get("/:id", getFoodDonationDetails);
router.put("/:id", verifyAuthToken, checkRole("Donor"), updateFoodDonation);
router.delete("/:id", verifyAuthToken, checkRole("Donor"), deleteFoodDonation);

export default router;
