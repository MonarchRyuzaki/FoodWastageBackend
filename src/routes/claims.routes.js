import express from "express";
import {
  cancelClaim,
  claimDonation,
  getClaimsByStatus,
  verifyOtp,
} from "../controllers/claims.js";
import { verifyAuthToken } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.post(
  "/food-donations/:donationId/claim",
  verifyAuthToken,
  checkRole("NGO"),
  claimDonation
);
router.post(
  "/food-donations/:donationId/verify-otp",
  verifyAuthToken,
  checkRole("NGO"),
  verifyOtp
);
router.delete(
  "/donations/claim/:claimId",
  verifyAuthToken,
  checkRole("NGO"),
  cancelClaim
);
router.get(
  "/donations/my-claims",
  verifyAuthToken,
  checkRole("NGO"),
  getClaimsByStatus
);

export default router;
