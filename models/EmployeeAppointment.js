import mongoose from "mongoose";

const EmployeeAppointmentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    notes: { type: String },
    mode: { type: String, enum: ["in_person", "video", "audio"], required: true },
  },
  { timestamps: true }
);


export default mongoose.model("EmployeeAppointment", EmployeeAppointmentSchema);
