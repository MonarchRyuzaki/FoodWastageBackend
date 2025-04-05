import express from "express";
import {
  cancelClaim,
  claimDonation,
  getClaimsByStatus,
  verifyOtp,
} from "../controllers/claims.js";
import { verifyAuthToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/food-donations/:donationId/claim", verifyAuthToken, claimDonation);
router.post("/food-donations/:donationId/verify-otp", verifyAuthToken, verifyOtp);
router.delete("/donations/claim/:claimId", verifyAuthToken, cancelClaim);
router.get("/donations/my-claims", verifyAuthToken, getClaimsByStatus);

export default router;
