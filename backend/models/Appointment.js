const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true
    },
    patientAge: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      required: true
    },
    problem: {
      type: String,
      default: ""
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    appointmentTime: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "Booked"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);