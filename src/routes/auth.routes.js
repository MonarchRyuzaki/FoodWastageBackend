import express from "express";
import { handleRegister } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", handleRegister);

router.get("/", (req, res) => {
  res.send("Auth route works!");
});

export default router;
