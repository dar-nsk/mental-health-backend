const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ChatQuestion = require("../models/ChatQuestion");
const ChatReply = require("../models/ChatReply");

// Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
}

// Create question
router.post("/questions", authMiddleware, async (req, res) => {
  try {
    const question = new ChatQuestion({
      user: req.userId,
      text: req.body.text,
    });
    await question.save();
    res.json({ message: "Question posted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all questions
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const questions = await ChatQuestion.find()
      .populate("user", "username")
      .sort("-createdAt");
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create reply
router.post("/replies", authMiddleware, async (req, res) => {
  try {
    const reply = new ChatReply({
      question: req.body.questionId,
      user: req.userId,
      text: req.body.text,
    });
    await reply.save();
    res.json({ message: "Reply posted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get replies for a question
router.get("/replies/:questionId", authMiddleware, async (req, res) => {
  try {
    const replies = await ChatReply.find({ question: req.params.questionId })
      .populate("user", "username")
      .sort("createdAt");
    res.json(replies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
