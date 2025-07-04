const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { createZoomMeeting } = require("../utils/zoom"); // you will create this file next

// Get bookings for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort("-date");
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all bookings (for counselor)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "counselor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookings = await Booking.find()
      .populate("user", "email")
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Accept or reject booking
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "counselor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const booking = await Booking.findById(req.params.id).populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (status === "accepted" && booking.mode === "virtual") {
      const zoomLink = await createZoomMeeting(booking.date);
      booking.zoomLink = zoomLink;
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error("Booking update error:", err.response?.data || err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a booking
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can create bookings." });
    }

    const { date, description, mode } = req.body;

    const existing = await Booking.findOne({ date: new Date(date) });
    if (existing) {
      return res
        .status(409)
        .json({ message: "This time slot is already booked. Please choose another." });
    }

    const booking = new Booking({
      user: req.user.id,
      date,
      description,
      mode,
      status: "pending",
    });

    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
