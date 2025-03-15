import express from "express";
import {
  getRoles,
  handleApplyEventHost,
  handleApplyFarmer,
  handleApplyNGORole,
  handleLogin,
  handleRegister,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/user/apply-farmer", handleApplyFarmer);
router.post("/user/apply-event-host", handleApplyEventHost);
router.post("/user/apply-ngo", handleApplyNGORole);
router.post("/user/roles/:userId", getRoles);

router.get("/", (req, res) => {
  res.send("Auth route works!");
});

export default router;
