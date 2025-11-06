// import express from "express";
// import Booking from "../models/Booking.js";
// import Doctor from "../models/Doctor.js";

// const router = express.Router();

// // Add a new booking
// router.post("/", async (req, res) => {
//   try {
//     const { doctorId, name, email, phone, date, slot, mode } = req.body;

//     if (!doctorId || !date || !slot || !name || !email) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     // Save booking
//     const booking = await Booking.create({
//       doctorId,
//       name,
//       email,
//       phone,
//       date,
//       slot,
//       mode,
//     });

//     // Remove booked slot from Doctor's availability
//     const doctor = await Doctor.findById(doctorId);
//     if (doctor) {
//       if (doctor.dateSlots && doctor.dateSlots.has(date)) {
//         const updatedSlots = doctor.dateSlots.get(date).filter((s) => s !== slot);
//         doctor.dateSlots.set(date, updatedSlots);
//         await doctor.save();
//       }
//     }

//     res.status(201).json({ success: true, data: booking });
//   } catch (err) {
//     console.error("Error creating booking:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;





import express from "express";
import nodemailer from "nodemailer";
import Booking from "../models/Booking.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

/* ------------------------------
   EMAIL SENDER (inline helper)
------------------------------ */
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};

/* -----------------------------------
   ADD A NEW BOOKING + SEND EMAILS
----------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { doctorId, name, email, phone, date, slot, mode } = req.body;

    if (!doctorId || !date || !slot || !name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 1️⃣ Create booking
    const booking = await Booking.create({
      doctorId,
      name,
      email,
      phone,
      date,
      slot,
      mode,
    });

    // 2️⃣ Update doctor's available slots
    const doctor = await Doctor.findById(doctorId);
    if (doctor && doctor.dateSlots && doctor.dateSlots.has(date)) {
      const updatedSlots = doctor.dateSlots.get(date).filter((s) => s !== slot);
      doctor.dateSlots.set(date, updatedSlots);
      await doctor.save();
    }

    // 3️⃣ Send confirmation emails
    if (doctor) {
      // To Doctor
      await sendEmail(
        doctor.email,
        "📅 New Appointment Booked",
        `Hello Dr. ${doctor.name},\n\nA new appointment has been booked:\n\n🧑 Patient: ${name}\n📧 Email: ${email}\n📞 Phone: ${phone || "N/A"}\n📅 Date: ${date}\n⏰ Time: ${slot}\n💬 Mode: ${mode || "video"}\n\nPlease check your dashboard for details.\n\n— Mindery Team`
      );

      // To Patient
      await sendEmail(
        email,
        "✅ Appointment Confirmation",
        `Hello ${name},\n\nYour session with Dr. ${doctor.name} has been successfully booked.\n\n📅 Date: ${date}\n⏰ Time: ${slot}\n💬 Mode: ${mode || "video"}\n\nYou'll receive reminders closer to your appointment.\n\n— Mindery Team`
      );
      console.log(name , doctor.name)
    }

    // 4️⃣ Respond
    res.status(201).json({
      success: true,
      message: "Booking created and email notifications sent successfully",
      data: booking,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: err.message,
    });
  }
});

export default router;
