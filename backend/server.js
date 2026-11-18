
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.send("Doctor Consultation Platform Backend is Running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Doctor Consultation API is working"
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

module.exports = app;
