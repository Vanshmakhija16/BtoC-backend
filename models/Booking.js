import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional — if patient login system exists
    },
    name: {
      type: String,
      required: true, // Patient name
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    date: {
      type: String, // "2025-10-29"
      required: true,
    },
    slot: {
      type: String, // "4:30 PM"
      required: true,
    },
    mode: {
      type: String, // e.g. "video", "in-person"
      default: "video",
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
