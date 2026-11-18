const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// Create appointment
router.post("/", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: savedAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update appointment status
router.patch("/:id/status", async (req, res) => {
  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Rejected",
    "Cancelled",
    "Completed"
  ];

  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment status"
    });
  }

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;