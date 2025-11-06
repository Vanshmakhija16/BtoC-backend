import express from "express";
import {   sendOtp, registerEmployee, loginEmployee } from "../controllers/employeeAuthController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);   // ✅ new route
router.post("/signup", registerEmployee);
router.post("/login", loginEmployee);

export default router;
