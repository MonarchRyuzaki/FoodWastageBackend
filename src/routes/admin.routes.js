// adminRoutes.js
import express from "express";
import {
  getApplicationDetails,
  getApplications,
  updateApplicationStatus,
} from "../controllers/admin.js";
import { verifyAuthToken } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.get(
  "/applications",
  verifyAuthToken,
  checkRole("admin"),
  getApplications
);
router.get(
  "/applications/:role/:id",
  verifyAuthToken,
  checkRole("admin"),
  getApplicationDetails
);
router.patch(
  "/applications/:role/:id",
  verifyAuthToken,
  checkRole("admin"),
  updateApplicationStatus
);

export default router;
