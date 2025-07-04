const mongoose = require("mongoose");

const chatReplySchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "ChatQuestion", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatReply", chatReplySchema);
