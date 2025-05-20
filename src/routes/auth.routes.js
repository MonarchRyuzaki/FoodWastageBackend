import express from "express";
import { idProofUpload } from "../config/multer.js";
import {
  getRoles,
  handleNGORegister,
  handleLogin,
  handleRegister,
  handleNGOLogin
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post(
  "/register-ngo",
  idProofUpload,
  handleNGORegister
);
router.post(
  "/login-ngo",
  handleNGOLogin
);
router.get("/user/roles/:userId", getRoles);

router.get("/", (req, res) => {
  res.send("Auth route works!");
});

export default router;
