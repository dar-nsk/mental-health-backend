const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ make sure the folder name is "middlewares", not "middleware"

const JWT_SECRET = "your_jwt_secret_here";

// Counselor credentials
const COUNSELOR_EMAIL = "counselor@domain.com";
const COUNSELOR_PASSWORD = "supersecretpassword";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if it's the counselor
  if (email === COUNSELOR_EMAIL) {
    if (password !== COUNSELOR_PASSWORD) {
      return res.status(400).json({ message: "Invalid counselor credentials" });
    }

    const token = jwt.sign(
      { email: COUNSELOR_EMAIL, role: "counselor" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        email: COUNSELOR_EMAIL,
        role: "counselor"
      }
    });
  }

  // Normal user login flow
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: "student" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: "student"
    }
  });
});

// ✅ ADD THIS ROUTE to support GET /auth/me
router.get("/me", authMiddleware, async (req, res) => {
  if (req.user.role === "counselor") {
    // Return counselor info
    return res.json({
      email: COUNSELOR_EMAIL,
      role: "counselor",
      username: "Counselor" // or whatever you want
    });
  }

  // For student, fetch from DB
  const user = await User.findById(req.user.id).select("email username");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    email: user.email,
    role: "student",
    username: user.username
  });
});

module.exports = router;
