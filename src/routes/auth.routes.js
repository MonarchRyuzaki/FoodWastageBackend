import express from "express";
import { idProofUpload } from "../config/multer.js";
import {
  getRoles,
  handleApplyEventHost,
  handleApplyFarmer,
  handleApplyNGORole,
  handleLogin,
  handleRegister,
} from "../controllers/auth.js";
import { verifyAuthToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post(
  "/user/apply-farmer",
  verifyAuthToken,
  idProofUpload,
  handleApplyFarmer
);
router.post(
  "/user/apply-event-host",
  verifyAuthToken,
  idProofUpload,
  handleApplyEventHost
);
router.post(
  "/user/apply-ngo",
  verifyAuthToken,
  idProofUpload,
  handleApplyNGORole
);
router.get("/user/roles/:userId", getRoles);

router.get("/", (req, res) => {
  res.send("Auth route works!");
});

export default router;
