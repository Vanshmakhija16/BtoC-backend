import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const otpStore = new Map(); // email -> { otp, expiresAt }

// ====================== SEND OTP ======================


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required" });

    const existing = await Employee.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 minutes validity

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("📨 Sending OTP to:", email);

    // ✅ Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify your email address",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log("✅ OTP Email sent successfully:", info.response);

    // ✅ Only one response here
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP", error: err.message });
    }
  }
};


// ====================== REGISTER (VERIFY OTP) ======================
export const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp)
      return res
        .status(400)
        .json({ message: "Name, email, password, and OTP are required" });

    // ✅ Verify OTP
    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ message: "OTP not found or expired" });
    if (Date.now() > record.expiresAt)
      return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);

    const existing = await Employee.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Employee already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { _id: employee._id, email: employee.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== LOGIN ======================
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const valid = await bcrypt.compare(password, employee.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: employee._id, email: employee.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
